import type { INetworkEntry } from '@/contract';
import type { IVariableValue } from '@/engine/types';
import { hiddenValues } from './hiddenValues';
import { maskedBody } from './maskedBody';
import { privateUrlOf } from './privateUrlOf';

/**
 * Uma chamada de API como o agente a lê: o id, o método, o endereço, como terminou e
 * quanto demorou, e o começo do que respondeu quando falhou, sem segredos.
 */
export function callLineOf(props: {
  call: INetworkEntry;
  values: IVariableValue[];
  bodyChars: number;
}): string {
  const { call, values } = props;
  const ended = call.status ?? call.failure ?? 'no answer yet';
  const took = call.durationMs === null ? '' : ` · ${String(call.durationMs)} ms`;
  const body =
    call.body === undefined
      ? ''
      : hiddenValues({ text: maskedBody(call.body).replace(/\s+/g, ' '), values });
  const cut = body.length > props.bodyChars ? `${body.slice(0, props.bodyChars)}…` : body;

  return `#${String(call.id)} ${call.method} ${privateUrlOf({ url: call.url, values })} → ${String(ended)}${took}${cut === '' ? '' : `: ${cut}`}`;
}
