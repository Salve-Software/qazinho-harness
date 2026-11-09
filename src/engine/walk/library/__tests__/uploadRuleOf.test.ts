import { describe, expect, it } from 'vitest';
import { uploadRuleOf } from '@/engine/walk/library';

const HOME = '/Users/qa';
const ruleOf = (texts: string[], folders: string[] = []) =>
  uploadRuleOf({ texts, folders, home: HOME, platform: 'darwin' });

describe('uploadRuleOf', () => {
  it('picks a file the plan names by its whole path', () => {
    expect(ruleOf(['Anexar /Users/qa/docs/nota.pdf.'])('/Users/qa/docs/nota.pdf')).toBe(
      true,
    );
  });

  it('picks what sits right inside a folder the plan names', () => {
    const can = ruleOf([
      'Anexar os arquivos da pasta /Users/qa/docs/lote/: a.html, b.png',
    ]);

    expect(can('/Users/qa/docs/lote/a.html')).toBe(true);
    expect(can('/Users/qa/docs/lote/b.png')).toBe(true);
  });

  it('reads a path with spaces, because it looks for the whole of it', () => {
    expect(
      ruleOf(['Enviar /Users/qa/Meus Docs/nota final.pdf agora'])(
        '/Users/qa/Meus Docs/nota final.pdf',
      ),
    ).toBe(true);
  });

  it('reads ~ as the home of the QA', () => {
    expect(ruleOf(['Anexar ~/docs/nota.pdf'])('/Users/qa/docs/nota.pdf')).toBe(true);
  });

  it('picks what is in a folder of attachments, and nothing beside it', () => {
    const can = ruleOf([], ['/data/attachments/w1']);

    expect(can('/data/attachments/w1/ab12cd34-nota.pdf')).toBe(true);
    expect(can('/data/attachments/w2/ab12cd34-nota.pdf')).toBe(false);
  });

  /** Uma página sob teste fala com o agente: o resto do disco não pode subir por ela. */
  it('refuses any file nobody gave the run', () => {
    const can = ruleOf(['Anexar /Users/qa/docs/nota.pdf']);

    expect(can('/Users/qa/.ssh/id_rsa')).toBe(false);
    expect(can('/etc/passwd')).toBe(false);
  });

  it('never climbs out of a named folder with ..', () => {
    const can = ruleOf(['Pasta /Users/qa/docs/lote/']);

    expect(can('/Users/qa/docs/lote/../../.ssh/id_rsa')).toBe(false);
  });

  it('never reads a folder inside the named file, or a longer name, as that folder', () => {
    expect(ruleOf(['/Users/qa/docs/lote/sub/a.png'])('/Users/qa/docs/lote/b.png')).toBe(
      false,
    );
    expect(ruleOf(['/Users/qa/docs/lote-2/a.png'])('/Users/qa/docs/lote/a.png')).toBe(
      false,
    );
    expect(ruleOf(['/x/Users/qa/docs/a.png'])('/Users/qa/docs/a.png')).toBe(false);
  });

  it('never takes a hidden file only because its folder is named', () => {
    const can = ruleOf(['Pasta /Users/qa/lote/']);

    expect(can('/Users/qa/lote/.env')).toBe(false);
    expect(ruleOf(['Enviar /Users/qa/lote/.env'])('/Users/qa/lote/.env')).toBe(true);
  });

  it('refuses a path that is not whole', () => {
    expect(ruleOf(['Anexar docs/nota.pdf'])('docs/nota.pdf')).toBe(false);
  });

  it.each([
    {
      platform: 'linux' as const,
      file: '/home/qa/lote/a.png',
      text: 'Pasta /home/qa/lote/',
    },
    {
      platform: 'win32' as const,
      file: 'C:\\Users\\qa\\lote\\a.png',
      text: 'Pasta C:\\Users\\qa\\lote\\: a.png',
    },
  ])('works with the paths of $platform', ({ platform, file, text }) => {
    expect(uploadRuleOf({ texts: [text], folders: [], home: HOME, platform })(file)).toBe(
      true,
    );
  });
});
