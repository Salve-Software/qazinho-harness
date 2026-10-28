import type { ToolAnswer } from '@/tools/types';
import type Anthropic from '@anthropic-ai/sdk';

/**
 * A resposta de uma ferramenta de dispositivo como a Messages API recebe o resultado de
 * uma ferramenta: as palavras, e a tela como imagem.
 */
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
