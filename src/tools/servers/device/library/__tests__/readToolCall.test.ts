import { describe, expect, it } from 'vitest';
import { readToolCall } from '@/tools/servers/device/library';

const REPORT = {
  step: 2,
  verdict: 'failed',
  why: ' The total is wrong ',
  got: 'R$ 0,00',
};

describe('readToolCall', () => {
  describe('actions', () => {
    it('turns a tool call into the action the device carries out', () => {
      expect(
        readToolCall({ name: 'fill', args: { target: 'Email', value: 'qa@shop.test' } }),
      ).toEqual({
        kind: 'act',
        action: { kind: 'fill', target: 'Email', value: 'qa@shop.test' },
      });
    });

    it('reads a scroll as its direction, with the words it stops at as the target', () => {
      expect(
        readToolCall({ name: 'scroll', args: { direction: 'down', until: ' Row 40 ' } }),
      ).toEqual({
        kind: 'act',
        action: { kind: 'scroll', target: 'Row 40', value: 'down' },
      });
      expect(readToolCall({ name: 'scroll', args: { direction: 'left' } })).toEqual({
        kind: 'act',
        action: { kind: 'scroll', target: '', value: 'left' },
      });
    });

    it('does NOT read a scroll with no direction, and says which ones there are', () => {
      expect(readToolCall({ name: 'scroll', args: { until: 'Row 40' } })).toEqual({
        kind: 'refused',
        error: '"scroll" needs "direction": down, up, left or right.',
      });
    });

    it('reads a drag with where it drops, and an upload with the kind of sample', () => {
      expect(
        readToolCall({ name: 'drag', args: { target: 'Card A', to: 'Done' } }),
      ).toEqual({
        kind: 'act',
        action: { kind: 'drag', target: 'Card A', value: 'Done' },
      });
      expect(
        readToolCall({ name: 'upload', args: { target: 'Avatar', file: 'image' } }),
      ).toEqual({
        kind: 'act',
        action: { kind: 'upload', target: 'Avatar', value: 'image' },
      });
      expect(readToolCall({ name: 'long_press', args: { target: 'Row 3' } })).toEqual({
        kind: 'act',
        action: { kind: 'long_press', target: 'Row 3', value: '' },
      });
    });

    /**
     * Pedido para fechar o app e abri-lo de novo, o runner só tinha o goto, que traz um
     * app de celular de volta como estava, e o back, que o deixa rodando: o app nunca
     * fechava de verdade.
     */
    it('reads reopen, which closes the app completely and opens it again, with nothing to aim at', () => {
      expect(readToolCall({ name: 'reopen', args: undefined })).toEqual({
        kind: 'act',
        action: { kind: 'reopen', target: '', value: '' },
      });
    });

    it('carries the answer a click gives the dialog it opens', () => {
      expect(
        readToolCall({ name: 'click', args: { target: 'Delete', dialog: 'cancel' } }),
      ).toEqual({
        kind: 'act',
        action: { kind: 'click', target: 'Delete', value: '', dialog: 'cancel' },
      });
    });

    it('carries what a click types into the prompt it opens', () => {
      expect(
        readToolCall({
          name: 'click',
          args: { target: 'Edit', promptText: 'New title' },
        }),
      ).toEqual({
        kind: 'act',
        action: { kind: 'click', target: 'Edit', value: '', promptText: 'New title' },
      });
    });

    it('does NOT take a dialog answer other than ok or cancel', () => {
      expect(
        readToolCall({ name: 'click', args: { target: 'Delete', dialog: 'maybe' } }),
      ).toEqual({ kind: 'refused', error: '"dialog" is ok or cancel.' });
    });

    it('waits without a target', () => {
      expect(readToolCall({ name: 'wait', args: { value: '500' } })).toEqual({
        kind: 'act',
        action: { kind: 'wait', target: '', value: '500' },
      });
    });

    it('fills a field with nothing, which clears it', () => {
      expect(
        readToolCall({ name: 'fill', args: { target: 'Coupon', value: '' } }),
      ).toMatchObject({
        kind: 'act',
      });
    });

    it('does NOT act on a control nobody named, and tells the agent why', () => {
      const refused = {
        kind: 'refused',
        error: '"click" needs a target: say what the control or URL is.',
      };

      expect(readToolCall({ name: 'click', args: {} })).toEqual(refused);
      expect(readToolCall({ name: 'click', args: { target: '   ' } })).toEqual(refused);
    });

    it('does NOT type when the agent left out what to type', () => {
      expect(readToolCall({ name: 'fill', args: { target: 'Email' } })).toEqual({
        kind: 'refused',
        error: '"fill" needs a value: say what to type.',
      });
    });

    it('refuses a tool the device does not have', () => {
      expect(readToolCall({ name: 'pinch', args: { target: 'Menu' } })).toEqual({
        kind: 'refused',
        error: 'There is no tool called "pinch".',
      });
    });

    it('looks with no argument at all', () => {
      expect(readToolCall({ name: 'look', args: undefined })).toEqual({ kind: 'look' });
    });
  });

  describe('report', () => {
    it('files what the agent judged, trimmed, with what is optional filled in', () => {
      expect(readToolCall({ name: 'report', args: REPORT })).toEqual({
        kind: 'report',
        report: {
          step: 2,
          verdict: 'failed',
          why: 'The total is wrong',
          got: 'R$ 0,00',
          title: '',
          severity: 'medium',
          goesOn: false,
          note: '',
          proof: '',
        },
      });
    });

    it('goes on after a failure only when the agent says the action went through', () => {
      expect(
        readToolCall({ name: 'report', args: { ...REPORT, goesOn: true } }),
      ).toMatchObject({ kind: 'report', report: { verdict: 'failed', goesOn: true } });
    });

    it('keeps the words that prove a step passed, for QAzinho to check without the agent', () => {
      expect(
        readToolCall({
          name: 'report',
          args: { ...REPORT, verdict: 'passed', proof: ' Visits: 1 ' },
        }),
      ).toMatchObject({
        kind: 'report',
        report: { verdict: 'passed', proof: 'Visits: 1' },
      });
    });

    it('keeps the bug title, the severity and the note when the agent gave them', () => {
      expect(
        readToolCall({
          name: 'report',
          args: {
            ...REPORT,
            title: 'Cart total ignores the coupon',
            severity: 'high',
            note: 'Closed a banner.',
          },
        }),
      ).toMatchObject({
        report: {
          title: 'Cart total ignores the coupon',
          severity: 'high',
          note: 'Closed a banner.',
        },
      });
    });

    it('does NOT file a verdict it does not know, and says which ones exist', () => {
      expect(
        readToolCall({ name: 'report', args: { ...REPORT, verdict: 'ok' } }),
      ).toEqual({
        kind: 'refused',
        error: '"report" needs "verdict": passed, failed or blocked.',
      });
    });

    it('does NOT file a report without a step number or a reason', () => {
      for (const args of [
        { ...REPORT, step: undefined },
        { ...REPORT, step: 0 },
        { ...REPORT, step: 1.5 },
        { ...REPORT, why: '  ' },
        undefined,
      ])
        expect(readToolCall({ name: 'report', args })).toHaveProperty('kind', 'refused');
    });

    it('asks for the severity again rather than guess it', () => {
      expect(
        readToolCall({ name: 'report', args: { ...REPORT, severity: 'huge' } }),
      ).toEqual({
        kind: 'refused',
        error: '"severity" is high, medium or low.',
      });
    });
  });

  describe('a bug on the side of a step', () => {
    const BUG = {
      title: ' Yearly price differs ',
      severity: 'medium',
      expected: 'One yearly price',
      got: '$20.49 on the page, $20.40 on the phone',
    };

    it('reads a bug the step does not ask about', () => {
      expect(readToolCall({ name: 'bug', args: BUG })).toEqual({
        kind: 'finding',
        finding: { ...BUG, title: 'Yearly price differs' },
      });
    });

    it('does NOT file a bug with nothing to know it by, and tells the agent why', () => {
      expect(readToolCall({ name: 'bug', args: { ...BUG, title: '  ' } })).toEqual({
        kind: 'refused',
        error: '"bug" needs "title": the line a developer would know the bug by.',
      });
    });
  });
  describe('a question for the QA', () => {
    it('reads the question with the answers it offers, trimmed and once each', () => {
      expect(
        readToolCall({
          name: 'ask_qa',
          args: {
            question: ' Which plan should I pick? ',
            options: [' Premium ', 'Premium+', 'Premium'],
          },
        }),
      ).toEqual({
        kind: 'ask',
        question: {
          question: 'Which plan should I pick?',
          screen: null,
          options: ['Premium', 'Premium+'],
          secret: null,
        },
      });
    });

    it('keeps the screen the agent says it is on, for the QA to see the question under', () => {
      expect(
        readToolCall({
          name: 'ask_qa',
          args: { question: 'Is there a coupon?', screen: ' Carrinho ' },
        }),
      ).toMatchObject({ kind: 'ask', question: { screen: 'Carrinho' } });
    });

    it('reads a secret with the variable it is kept as, its name in capitals', () => {
      expect(
        readToolCall({
          name: 'ask_qa',
          args: {
            question: 'What is the code texted to your phone?',
            secret: { name: ' otp_code ', description: 'The code texted to the QA' },
          },
        }),
      ).toEqual({
        kind: 'ask',
        question: {
          question: 'What is the code texted to your phone?',
          screen: null,
          options: [],
          secret: { name: 'OTP_CODE', description: 'The code texted to the QA' },
        },
      });
    });

    /**
     * Um segredo é digitado, nunca escolhido: opções ao lado dele poriam um valor na tela
     * para o agente.
     */
    it('leaves the options out of a secret', () => {
      const read = readToolCall({
        name: 'ask_qa',
        args: {
          question: 'Which password?',
          options: ['hunter2'],
          secret: { name: 'ADMIN_PASSWORD', description: 'The admin password' },
        },
      });

      expect(read.kind === 'ask' ? read.question.options : null).toEqual([]);
    });

    it('does NOT ask without a question, nor with more than four answers', () => {
      expect(readToolCall({ name: 'ask_qa', args: { options: ['Yes'] } })).toEqual({
        kind: 'refused',
        error: '"ask_qa" needs "question": what you need from the QA.',
      });
      expect(
        readToolCall({
          name: 'ask_qa',
          args: { question: 'Which?', options: ['A', 'B', 'C', 'D', 'E'] },
        }),
      ).toEqual({ kind: 'refused', error: '"options" holds four answers at most.' });
    });

    it('does NOT keep a secret under a name a variable cannot have', () => {
      expect(
        readToolCall({
          name: 'ask_qa',
          args: {
            question: 'What is the code?',
            secret: { name: 'the code', description: 'The code' },
          },
        }),
      ).toEqual({
        kind: 'refused',
        error:
          '"secret" needs "name": the variable to keep it as, in capitals with _ between words, such as OTP_CODE.',
      });
    });
  });

  describe('an exploration', () => {
    it('reads a screen the explorer reached, trimmed', () => {
      expect(
        readToolCall({
          name: 'screen',
          args: { name: ' Cart ', about: ' What was picked. ' },
        }),
      ).toEqual({ kind: 'screen', screen: { name: 'Cart', about: 'What was picked.' } });
    });

    it('does NOT note a screen with no name, and tells the agent why', () => {
      expect(readToolCall({ name: 'screen', args: { about: 'The cart.' } })).toEqual({
        kind: 'refused',
        error: '"screen" needs "name": what a person would call this screen.',
      });
    });

    it('reads the finish with the cases it suggests', () => {
      const cases = [
        {
          title: 'Apply a coupon',
          priority: 'P1',
          goal: 'A valid coupon takes 10% off.',
          preconditions: 'One product in the cart.',
          steps: [{ action: 'Apply SAVE10', expected: '10% off' }],
        },
      ];

      expect(
        readToolCall({ name: 'finish', args: { summary: ' The cart works. ', cases } }),
      ).toEqual({ kind: 'finish', finish: { summary: 'The cart works.', cases } });
    });

    it('does NOT finish without the cases, and says what is missing', () => {
      expect(readToolCall({ name: 'finish', args: { summary: 'Done.' } })).toEqual({
        kind: 'refused',
        error: '"finish" needs "cases": the test cases you suggest, as a list.',
      });
    });
  });

  it('reads which memory a line of say is about', () => {
    expect(
      readToolCall({ name: 'say', args: { text: 'Vou por Ajustes.', memory: 'm-1' } }),
    ).toEqual({ kind: 'say', text: 'Vou por Ajustes.', memory: 'm-1' });
    expect(readToolCall({ name: 'say', args: { text: 'Vou por Ajustes.' } })).toEqual({
      kind: 'say',
      text: 'Vou por Ajustes.',
    });
  });
});
