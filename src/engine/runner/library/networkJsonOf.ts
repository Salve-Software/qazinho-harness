import type { INetworkEntry } from '@/contract';
import type { IVariableValue } from '@/engine/types';
import { hiddenValues, maskedBody, privateUrlOf } from '@/engine/walk/library';

/**
 * As requisições de uma run, como o arquivo ao lado do vídeo: cada endereço e resposta,
 * com o valor de uma variável lido como o nome e um segredo como pontos.
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
