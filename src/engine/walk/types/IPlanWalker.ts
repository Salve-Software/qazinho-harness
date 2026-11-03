import type { ICaseAgent } from './ICaseAgent';
import type { WalkEvent } from './WalkEvent';
import type { IKnownBug, ITargetUnderTest, IViewport, Language } from '@/contract';
import type { IDeviceDriver } from '@/engine/devices/types';
import type { IVariableValue } from '@/engine/types';
import type { Harness } from '@/Harness.class';

/**
 * A run de um walk: o escopo das ferramentas, o dispositivo, o agente, o app, as
 * variáveis, os bugs abertos e quem ouve.
 */
export interface IPlanWalker {
  scope: string;
  runId: string;
  driver: IDeviceDriver;
  agent: ICaseAgent | null;
  harness: Harness;
  target: ITargetUnderTest;
  viewport: IViewport;
  language: Language;
  values: IVariableValue[];
  bugs: IKnownBug[];
  answers?: { caseId: string; question: string; answer: string }[];
  shotDir: string;
  onEvent: (event: WalkEvent) => void;
}
