import type { DialogAnswer } from './DialogAnswer';

/**
 * One action on the device as the agent asked for it, with the locators a web run used to
 * find its targets.
 */
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
