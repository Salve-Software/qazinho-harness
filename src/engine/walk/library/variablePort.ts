import type { IDeviceDriver } from '@/engine/devices/types';
import type { IVariableValue } from '@/engine/types';
import type { IDevicePort } from '@/tools/servers/device/types';
import { RUN_WALK } from '@/engine/walk/constants';
import { callLineOf } from './callLineOf';
import { hiddenValues } from './hiddenValues';
import { maskedBody } from './maskedBody';
import { resolvedAction } from './resolvedAction';

/**
 * The device as a run reaches it: a ${NAME} typed as its value, and every value shown
 * read back as its name.
 */
export function variablePort(props: {
  device: Pick<
    IDeviceDriver,
    'describe' | 'inspect' | 'glance' | 'motion' | 'act' | 'apiCalls' | 'responseBody'
  >;
  values: IVariableValue[];
}): IDevicePort {
  const { device, values } = props;
  let actedAt = Date.now();
  const lineOf = (call: Parameters<typeof callLineOf>[0]['call']) =>
    callLineOf({ call, values, bodyChars: RUN_WALK.callBodyChars });
  const hidden = (reason: unknown) =>
    new Error(
      hiddenValues({
        text: reason instanceof Error ? reason.message : String(reason),
        values,
      }),
    );

  return {
    describe: async () => {
      try {
        return hiddenValues({ text: await device.describe(), values });
      } catch (reason) {
        throw hidden(reason);
      }
    },
    inspect: async (target) => {
      try {
        return hiddenValues({ text: await device.inspect(target), values });
      } catch (reason) {
        throw hidden(reason);
      }
    },
    failedCalls: () =>
      Promise.resolve(
        (device.apiCalls?.(actedAt) ?? [])
          .filter(
            ({ status, failure }) =>
              failure !== null || (status !== null && status >= 400),
          )
          .map(lineOf),
      ),
    calls: async (ask) => {
      if (device.apiCalls === undefined)
        return 'This device keeps no API calls: only a browser does.';

      if (ask.id !== undefined) {
        const answer = await device.responseBody?.(ask.id);

        if (answer === null || answer === undefined)
          return `Call #${String(ask.id)} has no answer to read: it is not an API call, it failed before answering, or Chrome let it go.`;

        const shown = hiddenValues({ text: maskedBody(answer), values });

        return `Call #${String(ask.id)} answered:\n${shown.length > RUN_WALK.bodyShownChars ? `${shown.slice(0, RUN_WALK.bodyShownChars)}…` : shown}`;
      }

      const wanted = ask.filter?.toLowerCase();
      const listed = device
        .apiCalls(0)
        .filter(({ url }) => wanted === undefined || url.toLowerCase().includes(wanted))
        .slice(-RUN_WALK.callsListed);

      return listed.length === 0
        ? wanted === undefined
          ? 'The app made no API call yet.'
          : `No API call holds "${ask.filter ?? ''}" in its address.`
        : `The latest API calls, oldest first:\n${listed.map(lineOf).join('\n')}\nGive "id" to read what one answered.`;
    },
    glance: () => device.glance(),
    motion: () => device.motion(),
    act: async (action) => {
      actedAt = Date.now();

      try {
        await device.act(resolvedAction({ action, values }));
      } catch (reason) {
        throw hidden(reason);
      }
    },
  };
}
