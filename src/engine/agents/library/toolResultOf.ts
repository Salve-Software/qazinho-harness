import type { ToolAnswer } from '@/tools/types';
import type Anthropic from '@anthropic-ai/sdk';

/** A device tool's answer as the Messages API takes a tool's result: its words, and the screen as a picture. */
export function toolResultOf(props: {
  id: string;
  answer: ToolAnswer;
}): Anthropic.ToolResultBlockParam {
  return {
    type: 'tool_result',
    tool_use_id: props.id,
    content: props.answer.content.map((part) =>
      part.type === 'text'
        ? { type: 'text' as const, text: part.text }
        : {
            type: 'image' as const,
            source: {
              type: 'base64' as const,
              media_type: part.mimeType,
              data: part.data,
            },
          },
    ),
    is_error: props.answer.isError,
  };
}
