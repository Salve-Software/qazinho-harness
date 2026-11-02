import type { IHarnessSection } from '@/context/types';
import type { IImportSource } from '@/contract';
import { IMPORT_SECTION } from '@/constants';

/**
 * A pasta de testes que o QA importa como o agente a lê: onde está, o que o QAzinho
 * reconheceu nela e os arquivos que parecem testes.
 */
export function describeImport(props: {
  source: IImportSource | null;
  wasTold: boolean;
}): IHarnessSection {
  const { source } = props;

  if (source === null)
    return {
      title: IMPORT_SECTION.title,
      lines: props.wasTold
        ? [
            'The folder of tests is closed now that the plan is written. Plan from what you read, and ask the QA for what you did not.',
          ]
        : [],
    };

  const listed = source.files.slice(0, IMPORT_SECTION.files);
  const unlisted = source.files.length - listed.length;

  return {
    title: IMPORT_SECTION.title,
    lines: [
      `Folder ${source.name}${source.branch === null ? '' : `, branch ${source.branch}`}${source.commit === null ? '' : ` at ${source.commit.slice(0, IMPORT_SECTION.shaLength)}`}.`,
      `The tests are at ${source.dir}. Read them with your tools; it is read only, and it is closed once the plan is written.`,
      source.frameworks.length === 0
        ? 'The QAzinho did not recognize a test framework by name: find out from the files what drives these tests.'
        : `The QAzinho recognized: ${source.frameworks.map(({ id, files }) => `${id} (${String(files)} ${files === 1 ? 'file' : 'files'})`).join(', ')}. Confirm it by reading.`,
      ...(listed.length === 0
        ? []
        : ['Files that look like tests:', ...listed.map((file) => `  ${file}`)]),
      ...(unlisted > 0 ? [`  and ${String(unlisted)} more.`] : []),
    ],
  };
}
