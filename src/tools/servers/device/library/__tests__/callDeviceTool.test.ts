import type { IActionMotion, IDeviceImage, IStepAction } from '@/contract';
import type {
  IAttachDevice,
  IStepFinding,
  IStepReport,
} from '@/tools/servers/device/types';
import { describe, expect, it } from 'vitest';
import { callDeviceTool } from '@/tools/servers/device/library';

const PICTURE: IDeviceImage = { data: 'aGVsbG8=', mimeType: 'image/jpeg' };

/**
 * Um dispositivo que lembra o que pediram a ele, e mostra uma tela e uma imagem fixas.
 */
function fakeDevice(
  props: {
    fails?: string;
    onReport?: IAttachDevice['onReport'];
    onFinding?: IAttachDevice['onFinding'];
    image?: IDeviceImage | null;
    motion?: IActionMotion | null;
    blind?: boolean;
    failed?: string[];
  } = {},
) {
  const acted: IStepAction[] = [];
  const asked: { id?: number; filter?: string }[] = [];
  const device: IAttachDevice = {
    workspaceId: 'w1',
    driver: {
      describe: async () => 'Cart · [button] Apply',
      inspect: async (target) => `"${target}" (button), measured in CSS px:`,
      failedCalls: async () => props.failed ?? [],
      calls: async (ask) => {
        asked.push(ask);

        return '#3 POST https://shop.test/api/coupon → 500 · 212 ms';
      },
      glance: async () => {
        if (props.blind === true) throw new Error('no screencap');
        return props.image === undefined ? PICTURE : props.image;
      },
      motion: async () => props.motion ?? null,
      act: async (action) => {
        if (props.fails !== undefined) throw new Error(props.fails);
        acted.push(action);
      },
    },
    onReport: props.onReport,
    onFinding: props.onFinding,
  };

  return { device, acted, asked };
}

type Answer = Awaited<ReturnType<typeof callDeviceTool>>;

const text = (answer: Answer) => {
  const first = answer.content[0];

  return first?.type === 'text' ? first.text : undefined;
};

const images = (answer: Answer) => answer.content.filter(({ type }) => type === 'image');

describe('callDeviceTool', () => {
  it('reads the screen on look', async () => {
    const { device } = fakeDevice();

    expect(text(await callDeviceTool({ device, call: { name: 'look', args: {} } }))).toBe(
      'Cart · [button] Apply',
    );
  });

  it('says which API calls failed while it acted, before what the device shows', async () => {
    const { device } = fakeDevice({
      failed: ['#3 POST https://shop.test/api/coupon → 500 · 212 ms: {"error":"down"}'],
    });
    const answer = text(
      await callDeviceTool({
        device,
        call: { name: 'click', args: { target: 'Apply' } },
      }),
    );

    expect(answer).toContain(
      'API calls that failed during it:\n- #3 POST https://shop.test/api/coupon → 500 · 212 ms: {"error":"down"}\n The device now shows:',
    );
  });

  it('says nothing of calls when none failed', async () => {
    const { device } = fakeDevice();

    expect(
      text(
        await callDeviceTool({
          device,
          call: { name: 'click', args: { target: 'Apply' } },
        }),
      ),
    ).not.toContain('API calls');
  });

  it('lists the API calls, or reads what one answered, and touches nothing', async () => {
    const { device, asked, acted } = fakeDevice();

    expect(
      text(
        await callDeviceTool({
          device,
          call: { name: 'network', args: { filter: ' coupon ' } },
        }),
      ),
    ).toBe('#3 POST https://shop.test/api/coupon → 500 · 212 ms');
    await callDeviceTool({ device, call: { name: 'network', args: { id: 3 } } });

    expect(asked).toEqual([{ filter: 'coupon' }, { id: 3 }]);
    expect(acted).toEqual([]);
  });

  it('refuses a call id that is not a number it listed', async () => {
    const { device } = fakeDevice();
    const answer = await callDeviceTool({
      device,
      call: { name: 'network', args: { id: -1 } },
    });

    expect(answer.isError).toBe(true);
    expect(text(answer)).toContain('"id" is the number a call is listed with');
  });

  it('measures what the agent named, and touches nothing', async () => {
    const { device, acted } = fakeDevice();
    const answer = await callDeviceTool({
      device,
      call: { name: 'inspect', args: { target: 'Apply' } },
    });

    expect(text(answer)).toBe('"Apply" (button), measured in CSS px:');
    expect(images(answer)).toEqual([]);
    expect(acted).toEqual([]);
  });

  it('asks again for what to measure when the agent named nothing', async () => {
    const { device } = fakeDevice();
    const answer = await callDeviceTool({ device, call: { name: 'inspect', args: {} } });

    expect(answer.isError).toBe(true);
    expect(text(answer)).toContain('"inspect" needs a target');
  });

  it('acts, then says what the device shows after', async () => {
    const { device, acted } = fakeDevice();
    const answer = await callDeviceTool({
      device,
      call: { name: 'click', args: { target: 'Apply' } },
    });

    expect(acted).toEqual([{ kind: 'click', target: 'Apply', value: '' }]);
    expect(answer.isError).toBe(false);
    expect(text(answer)).toContain('The device now shows:\nCart');
  });

  /**
   * O registro de uma run dizia que um passo fechou e reabriu o app, sem nada sobre como
   * foi feito.
   */
  it('says the app closed completely and opened again after reopen', async () => {
    const { device, acted } = fakeDevice();

    expect(
      text(await callDeviceTool({ device, call: { name: 'reopen', args: {} } })),
    ).toBe(
      'Done: the app closed completely and opened again. The device now shows:\nCart · [button] Apply',
    );
    expect(acted).toEqual([{ kind: 'reopen', target: '', value: '' }]);
  });

  it('says back why an action failed, with no terminal colour codes', async () => {
    const ESC = String.fromCharCode(27);
    const { device } = fakeDevice({ fails: `${ESC}[2mTimeout${ESC}[22m` });
    const answer = await callDeviceTool({
      device,
      call: { name: 'click', args: { target: 'Apply' } },
    });

    expect(answer).toEqual({
      content: [{ type: 'text', text: 'That did not work: Timeout' }],
      isError: true,
    });
  });

  it('files a report with the run and passes on what comes next', async () => {
    const reports: IStepReport[] = [];
    const { device } = fakeDevice({
      onReport: async (report) => {
        reports.push(report);
        return 'Filed. Next is step 2';
      },
    });
    const answer = await callDeviceTool({
      device,
      call: {
        name: 'report',
        args: { step: 1, verdict: 'passed', why: 'It shows', got: 'Cart' },
      },
    });

    expect(reports).toHaveLength(1);
    expect(text(answer)).toBe('Filed. Next is step 2');
  });

  it('does NOT accept a report when there is no run to hear it', async () => {
    const { device } = fakeDevice();
    const answer = await callDeviceTool({
      device,
      call: {
        name: 'report',
        args: { step: 1, verdict: 'passed', why: 'It shows', got: 'Cart' },
      },
    });

    expect(answer.isError).toBe(true);
  });

  it('turns an unknown tool into an error the agent can read, without touching the device', async () => {
    const { device, acted } = fakeDevice();
    const answer = await callDeviceTool({ device, call: { name: 'swipe', args: {} } });

    expect(answer.isError).toBe(true);
    expect(acted).toEqual([]);
  });

  describe('what the agent sees', () => {
    it('hands over a picture of the screen with the text, on look and after an action', async () => {
      const { device } = fakeDevice();

      for (const call of [
        { name: 'look', args: {} },
        { name: 'click', args: { target: 'Apply' } },
      ])
        expect(images(await callDeviceTool({ device, call }))).toEqual([
          { type: 'image', ...PICTURE },
        ]);
    });

    it('answers with the text alone when the device has no picture, or fails to take one', async () => {
      for (const device of [
        fakeDevice({ image: null }).device,
        fakeDevice({ blind: true }).device,
      ]) {
        const answer = await callDeviceTool({ device, call: { name: 'look', args: {} } });

        expect(answer.isError).toBe(false);
        expect(images(answer)).toEqual([]);
      }
    });

    it('says how the page moved while it acted', async () => {
      const { device } = fakeDevice({
        motion: {
          shift: 0.31,
          unexpectedShift: 0.31,
          shifts: 2,
          longFrames: 1,
          slowestFrameMs: 180,
        },
      });
      const answer = await callDeviceTool({
        device,
        call: { name: 'click', args: { target: 'Apply' } },
      });

      expect(text(answer)).toMatch(/^Done\. While it acted, the layout shifted 0\.31/);
    });

    it('says nothing about motion for a device that cannot measure it', async () => {
      const { device } = fakeDevice({ motion: null });
      const answer = await callDeviceTool({
        device,
        call: { name: 'click', args: { target: 'Apply' } },
      });

      expect(text(answer)).toMatch(/^Done\. The device now shows:/);
    });
  });

  describe('a bug on the side of a step', () => {
    const BUG = {
      title: 'Yearly price differs',
      severity: 'medium',
      expected: 'One yearly price',
      got: '$20.49 and $20.40',
    };

    it('hands the bug to the run and says what the run answered', async () => {
      const filed: IStepFinding[] = [];
      const { device } = fakeDevice({
        onFinding: async (finding) => {
          filed.push(finding);

          return 'Filed as a bug. Carry on with step 2.';
        },
      });

      const answer = await callDeviceTool({ device, call: { name: 'bug', args: BUG } });

      expect(filed).toEqual([BUG]);
      expect(text(answer)).toBe('Filed as a bug. Carry on with step 2.');
    });

    it('does NOT file a bug with no run to file it in', async () => {
      const answer = await callDeviceTool({
        device: fakeDevice().device,
        call: { name: 'bug', args: BUG },
      });

      expect(answer.isError).toBe(true);
    });
  });
  describe('a question for the QA', () => {
    it('hands the question to the run and passes on what the QA answered', async () => {
      const { device, acted } = fakeDevice();
      const asked: unknown[] = [];
      const answer = await callDeviceTool({
        device: {
          ...device,
          onAsk: async (question) => {
            asked.push(question);

            return 'The QA answered: Premium+';
          },
        },
        call: {
          name: 'ask_qa',
          args: { question: 'Which plan?', options: ['Premium', 'Premium+'] },
        },
      });

      expect(asked).toEqual([
        { question: 'Which plan?', options: ['Premium', 'Premium+'], secret: null },
      ]);
      expect(answer.isError).toBe(false);
      expect(text(answer)).toBe('The QA answered: Premium+');
      expect(acted).toEqual([]);
    });

    it('does NOT ask with no run to wait for the answer', async () => {
      const answer = await callDeviceTool({
        device: fakeDevice().device,
        call: { name: 'ask_qa', args: { question: 'Which plan?' } },
      });

      expect(answer.isError).toBe(true);
      expect(text(answer)).toBe('There is no QA to ask outside a run.');
    });
  });

  describe('an exploration', () => {
    it('hands a screen and a finish to the exploration that hears them', async () => {
      const heard: string[] = [];
      const device: IAttachDevice = {
        ...fakeDevice().device,
        purpose: 'explore',
        onScreen: async (screen) => {
          heard.push(`screen ${screen.name}: ${screen.about}`);
          return 'Noted.';
        },
        onFinish: async (finish) => {
          heard.push(
            `finish ${finish.summary} with ${String(finish.cases.length)} cases`,
          );
          return 'End your turn now.';
        },
      };

      expect(
        text(
          await callDeviceTool({
            device,
            call: {
              name: 'screen',
              args: { name: 'Cart', about: 'What the buyer picked.' },
            },
          }),
        ),
      ).toBe('Noted.');
      expect(
        text(
          await callDeviceTool({
            device,
            call: { name: 'finish', args: { summary: 'The cart works.', cases: [] } },
          }),
        ),
      ).toBe('End your turn now.');
      expect(heard).toEqual([
        'screen Cart: What the buyer picked.',
        'finish The cart works. with 0 cases',
      ]);
    });

    it('says how much time is left after each action, and on a look', async () => {
      const { device } = fakeDevice();
      const exploring = { ...device, endsAt: Date.now() + 7 * 60_000 + 10_000 };

      expect(
        text(
          await callDeviceTool({
            device: exploring,
            call: { name: 'click', args: { target: 'Apply' } },
          }),
        ),
      ).toContain('Done. About 7 minutes left. The device now shows:');
      expect(
        text(
          await callDeviceTool({ device: exploring, call: { name: 'look', args: {} } }),
        ),
      ).toContain('About 7 minutes left. The device shows:');
    });

    it('does NOT act once the time is up, and tells the agent to finish', async () => {
      const { device, acted } = fakeDevice();
      const answer = await callDeviceTool({
        device: { ...device, endsAt: Date.now() - 1 },
        call: { name: 'click', args: { target: 'Apply' } },
      });

      expect(answer.isError).toBe(true);
      expect(text(answer)).toBe('Time is up: call finish now with what you saw.');
      expect(acted).toEqual([]);
    });

    it('does NOT note a screen when nothing explores', async () => {
      const answer = await callDeviceTool({
        device: fakeDevice().device,
        call: { name: 'screen', args: { name: 'Cart', about: 'The cart.' } },
      });

      expect(answer.isError).toBe(true);
      expect(text(answer)).toBe('There is no exploration to note a screen in.');
    });
  });
});
