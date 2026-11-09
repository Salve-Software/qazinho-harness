import type { DialogAnswer } from './DialogAnswer';

/**
 * Uma ação no dispositivo como o agente a pediu, com os locators que uma run web usou
 * para achar os alvos.
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
    | 'upload'
    | 'open_download'
    | 'tab';
  target: string;
  value: string;
  dialog?: DialogAnswer;
  promptText?: string;
  locator?: string;
  toLocator?: string;
  option?: string;
  files?: string[];
}
