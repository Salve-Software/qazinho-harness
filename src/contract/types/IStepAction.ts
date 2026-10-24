import type { DialogAnswer } from './DialogAnswer';

/** One thing to do on the device, as the agent asked for it; `locator`, `toLocator` and `option` keep how a web run found its targets, for code that does it again. A scroll keeps its direction in `value` and the words it stops at in `target`, a drag where it drops in `value`, and an upload the kind of sample file in `value`. */
export interface IStepAction {
  kind:
    | 'goto'
    | 'reopen'
    | 'click'
    | 'fill'
    | 'press'
    | 'wait'
    | 'scroll'
    | 'long_press'
    | 'drag'
    | 'hover'
    | 'upload';
  target: string;
  value: string;
  dialog?: DialogAnswer;
  promptText?: string;
  locator?: string;
  toLocator?: string;
  option?: string;
}
