import type { IAttachDevice } from '@/tools/servers/device/types';
import type { ToolAnswer } from '@/tools/types';
import { WEB_DRIVER } from '@/engine/devices/WebDriver/constants';
import { withinLimit } from '@/engine/library/withinLimit';
import { stripAnsi } from '@/library';
import { LEARNING_NOTE } from '@/tools/servers/device/constants';
import { readToolCall } from './readToolCall';
import { timeLeftOf } from './timeLeftOf';

/**
 * Executa uma chamada de ferramenta do dispositivo e responde com a tela como texto e
 * como imagem, ou por que não conseguiu, com o que a run tem a dizer ao agente antes.
 */
export async function callDeviceTool(props: {
  device: IAttachDevice;
  call: { name: string; args: Record<string, unknown> | undefined };
}): Promise<ToolAnswer> {
  const answer = await answerOf(props);
  const aside = props.device.aside?.() ?? null;

  return aside === null
    ? answer
    : { ...answer, content: [{ type: 'text', text: aside }, ...answer.content] };
}

async function answerOf(props: {
  device: IAttachDevice;
  call: { name: string; args: Record<string, unknown> | undefined };
}): Promise<ToolAnswer> {
  const { device } = props;
  const read = readToolCall(props.call);

  try {
    if (read.kind === 'refused') return said(read.error, true);

    if (read.kind === 'look')
      return await shown({
        device,
        lead:
          device.endsAt === undefined
            ? ''
            : `${timeLeftOf(device.endsAt - Date.now())} The device shows:\n`,
      });

    if (read.kind === 'inspect') return said(await device.driver.inspect(read.target));

    if (read.kind === 'network') return said(await device.driver.calls(read.ask));

    if (read.kind === 'report') {
      if (!device.onReport) return said('There is no run to report to.', true);

      return said(await device.onReport(read.report));
    }

    if (read.kind === 'finding') {
      if (!device.onFinding) return said('There is no run to file a bug in.', true);

      return said(await device.onFinding(read.finding));
    }

    if (read.kind === 'ask') {
      if (!device.onAsk) return said('There is no QA to ask outside a run.', true);

      return said(await device.onAsk(read.question));
    }

    if (read.kind === 'say') return said((await device.onSay?.(read)) ?? 'Noted.');

    if (read.kind === 'answer') {
      if (!device.onAnswer) return said('There is no QA to answer outside a run.', true);

      return said(await device.onAnswer(read.text));
    }

    if (read.kind === 'screen') {
      if (!device.onScreen)
        return said('There is no exploration to note a screen in.', true);

      return said(await device.onScreen(read.screen));
    }

    if (read.kind === 'finish') {
      if (!device.onFinish) return said('There is no exploration to finish.', true);

      return said(await device.onFinish(read.finish));
    }

    if (device.endsAt !== undefined && Date.now() >= device.endsAt)
      return said('Time is up: call finish now with what you saw.', true);

    await device.driver.act(read.action);

    const failed = await device.driver.failedCalls().catch(() => []);
    const calls =
      failed.length === 0
        ? ''
        : ` API calls that failed during it:\n${failed.map((line) => `- ${line}`).join('\n')}\n`;

    const done =
      read.action.kind === 'reopen'
        ? 'Done: the app closed completely and opened again.'
        : read.action.kind === 'open_download'
          ? 'Done: the file is open on a new screen. Scroll for the rest, and tab with "close" goes back to the app.'
          : 'Done.';

    const left =
      device.endsAt === undefined ? '' : ` ${timeLeftOf(device.endsAt - Date.now())}`;

    return await shown({
      device,
      lead: `${done}${left}${calls} The device now shows:\n`,
    });
  } catch (reason) {
    const message = reason instanceof Error ? reason.message : String(reason);

    return said(`That did not work: ${stripAnsi(message)}`, true);
  }
}

function said(text: string, isError = false): ToolAnswer {
  return { content: [{ type: 'text', text }], isError };
}

async function shown(props: {
  device: IAttachDevice;
  lead: string;
}): Promise<ToolAnswer> {
  const { driver } = props.device;
  const [text, image] = await Promise.all([
    driver.describe(),
    withinLimit({
      work: driver.glance(),
      ms: WEB_DRIVER.readLimitMs,
      said: WEB_DRIVER.readLimitWords,
    }).catch(() => null),
  ]);

  return {
    content: [
      {
        type: 'text',
        text: `${props.lead}${text}${props.device.purpose === 'learn' ? LEARNING_NOTE : ''}`,
      },
      ...(image === null ? [] : [{ type: 'image' as const, ...image }]),
    ],
    isError: false,
  };
}
