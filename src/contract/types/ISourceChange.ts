/**
 * O que mudou numa fonte do plano depois que ele foi escrito: a história, a página, a
 * branch, ou a transcrição de uma reunião que o QA trouxe.
 */
export type ISourceChange =
  | {
      kind: 'story';
      key: string;
      url: string;
      at: string;
      before: string;
      after: string;
      comments: { author: string; at: string; text: string }[];
    }
  | {
      kind: 'page';
      title: string;
      url: string;
      at: string;
      before: string;
      after: string;
    }
  | { kind: 'meeting'; name: string; at: string; text: string }
  | {
      kind: 'code';
      repository: string;
      branch: string;
      from: string;
      to: string;
      files: { path: string; patch: string }[];
    };
