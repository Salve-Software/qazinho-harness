import type { ICaseAgent } from './ICaseAgent';
import type { WalkEvent } from './WalkEvent';
import type { IKnownBug, ITargetUnderTest, IViewport, Language } from '@/contract';
import type { IDeviceDriver } from '@/engine/devices/types';
import type { IVariableValue } from '@/engine/types';
import type { Harness } from '@/Harness.class';

/** A walk's run: the scope its tools answer under, the device opened for it, the agent that walks what no recording holds, if any, the app and the QA's language, the variables it types, the bugs already open, where its screens go, and who hears how it goes. */
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
  shotDir: string;
  onEvent: (event: WalkEvent) => void;
}
