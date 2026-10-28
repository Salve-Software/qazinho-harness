const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

const PDF = Buffer.from(
  [
    '%PDF-1.4',
    '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
    '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
    '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 200 200] >> endobj',
    'trailer << /Root 1 0 R >>',
    '%%EOF',
    '',
  ].join('\n'),
);

/**
 * Um arquivo de exemplo pequeno de um tipo, para um upload que um teste precisa: o nome e
 * os bytes; texto para um tipo que ele não conhece.
 */
export function sampleFileOf(kind: string): { name: string; bytes: Buffer } {
  switch (kind) {
    case 'image':
      return { name: 'qazinho-sample.png', bytes: PNG };
    case 'pdf':
      return { name: 'qazinho-sample.pdf', bytes: PDF };
    case 'csv':
      return {
        name: 'qazinho-sample.csv',
        bytes: Buffer.from(
          'name,email\nAna Souza,ana@qazinho.test\nBruno Lima,bruno@qazinho.test\n',
        ),
      };
    default:
      return {
        name: 'qazinho-sample.txt',
        bytes: Buffer.from('A sample file QAzinho uploaded.\n'),
      };
  }
}
