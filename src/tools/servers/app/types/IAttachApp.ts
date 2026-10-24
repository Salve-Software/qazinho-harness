import type { AppToolCall } from '@/contract';

/** Who carries the app tools out for the length of an assistant turn, under the scope its address carries. */
export interface IAttachApp {
  scope: string;
  perform: (call: AppToolCall) => Promise<{ text: string; isError: boolean }>;
}
