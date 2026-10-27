import type { INetworkEntry } from '@/contract';
import type { IVariableValue } from '@/engine/types';
import { hiddenValues, maskedBody, privateUrlOf } from '@/engine/walk/library';

/**
 * The requests a run kept, as the file that goes beside its video: each address and
 * answer with a variable's value read back as its name and a secret as dots.
 */
export function networkJsonOf(props: {
  entries: INetworkEntry[];
  values: IVariableValue[];
}): string {
  return JSON.stringify(
    props.entries.map((entry) => ({
      ...entry,
      url: privateUrlOf({ url: entry.url, values: props.values }),
      ...(entry.body === undefined
        ? {}
        : { body: hiddenValues({ text: maskedBody(entry.body), values: props.values }) }),
    })),
  );
}
