import type { IStepAction } from '@/contract';
import { describe, expect, it } from 'vitest';
import { variablePort } from '@/engine/walk/library';

const VALUES = [{ name: 'LOGIN_PASSWORD', description: '', value: 'Sup3r-s3cret' }];

/**
 * Um dispositivo que guarda o que pediram para digitar, mostra uma página que repete o
 * texto, e falha quando mandam.
 */
function fakeDevice(failing = false) {
  const typed: IStepAction[] = [];
  const device: Parameters<typeof variablePort>[0]['device'] = {
    describe: () => Promise.resolve(`[field] Password: ${typed.at(-1)?.value ?? ''}`),
    inspect: (target) =>
      Promise.resolve(`"${typed.at(-1)?.value ?? ''}" (${target}), measured in CSS px:`),
    glance: () => Promise.resolve(null),
    act: (action) => {
      typed.push(action);

      return failing
        ? Promise.reject(new Error(`Nothing took "${action.value}".`))
        : Promise.resolve();
    },
  };

  return { device, typed };
}

describe('variablePort', () => {
  it('types the value on the device, and shows the agent the variable instead', async () => {
    const { device, typed } = fakeDevice();
    const port = variablePort({ device, values: VALUES });

    await port.act({ kind: 'fill', target: 'Password', value: '${LOGIN_PASSWORD}' });

    expect(typed).toEqual([{ kind: 'fill', target: 'Password', value: 'Sup3r-s3cret' }]);
    expect(await port.describe()).toBe('[field] Password: ${LOGIN_PASSWORD}');
  });

  it('reads a value back as its variable in what it measured', async () => {
    const { device } = fakeDevice();
    const port = variablePort({ device, values: VALUES });

    await port.act({ kind: 'fill', target: 'Password', value: '${LOGIN_PASSWORD}' });

    expect(await port.inspect('input')).toBe(
      '"${LOGIN_PASSWORD}" (input), measured in CSS px:',
    );
  });

  it('does NOT say a value in why an action failed', async () => {
    const port = variablePort({ device: fakeDevice(true).device, values: VALUES });

    await expect(
      port.act({ kind: 'fill', target: 'Password', value: '${LOGIN_PASSWORD}' }),
    ).rejects.toThrow('Nothing took "${LOGIN_PASSWORD}".');
  });

  it('does NOT reach the device for a variable the project does not keep', async () => {
    const { device, typed } = fakeDevice();

    await expect(
      variablePort({ device, values: VALUES }).act({
        kind: 'fill',
        target: 'Email',
        value: '${LOGIN_EMAIL}',
      }),
    ).rejects.toThrow('no variable called ${LOGIN_EMAIL}');
    expect(typed).toEqual([]);
  });

  describe('the API calls', () => {
    const CALL = {
      method: 'POST',
      type: 'fetch',
      failure: null,
      durationMs: 120,
      size: 10,
    };

    /**
     * Um navegador que fez três chamadas: uma antiga, uma que falhou depois do clique e
     * uma que deu certo.
     */
    function browser() {
      const startedAt = Date.now();
      const calls = [
        {
          ...CALL,
          id: 1,
          url: 'https://shop.test/api/cart',
          status: 500,
          startedAt: startedAt - 60_000,
        },
        {
          ...CALL,
          id: 2,
          url: 'https://shop.test/api/coupon',
          status: 500,
          startedAt: startedAt + 1_000,
          body: '{"error":"down for Sup3r-s3cret","token":"abc"}',
        },
        {
          ...CALL,
          id: 3,
          url: 'https://shop.test/api/total',
          status: 200,
          startedAt: startedAt + 1_200,
        },
      ];

      return {
        ...fakeDevice().device,
        apiCalls: (since: number) => calls.filter((call) => call.startedAt >= since),
        responseBody: (id: number) =>
          Promise.resolve(id === 3 ? '{"total":90,"sessionId":"s-1"}' : null),
      };
    }

    it('says the calls that failed since the last action, secrets and values left out', async () => {
      const port = variablePort({ device: browser(), values: VALUES });

      await port.act({ kind: 'click', target: 'Apply', value: '' });

      expect(await port.failedCalls()).toEqual([
        '#2 POST https://shop.test/api/coupon → 500 · 120 ms: {"error":"down for ${LOGIN_PASSWORD}","token":"•••"}',
      ]);
    });

    it('lists the calls by what their address holds, and reads what one answered', async () => {
      const port = variablePort({ device: browser(), values: VALUES });

      expect(await port.calls({ filter: 'TOTAL' })).toBe(
        'The latest API calls, oldest first:\n#3 POST https://shop.test/api/total → 200 · 120 ms\nGive "id" to read what one answered.',
      );
      expect(await port.calls({ id: 3 })).toBe(
        'Call #3 answered:\n{"total":90,"sessionId":"•••"}',
      );
      expect(await port.calls({ id: 9 })).toContain('Call #9 has no answer to read');
    });

    it('says a phone keeps no calls', async () => {
      const port = variablePort({ device: fakeDevice().device, values: [] });

      expect(await port.failedCalls()).toEqual([]);
      expect(await port.calls({})).toBe(
        'This device keeps no API calls: only a browser does.',
      );
    });
  });

  describe('act, for a file of the QA', () => {
    const upload: IStepAction = {
      kind: 'upload',
      target: 'Anexar',
      value: 'nota.pdf',
      files: ['/qa/nota.pdf'],
    };

    it('picks the path the run hands over, which may be a copy under the real name', async () => {
      const { device, typed } = fakeDevice();
      const port = variablePort({
        device,
        values: [],
        uploadPath: (file) => Promise.resolve(`/tmp/copia${file}`),
      });

      await port.act(upload);

      expect(typed[0]?.files).toEqual(['/tmp/copia/qa/nota.pdf']);
    });

    it('touches nothing when a file was not given to the run', async () => {
      const { device, typed } = fakeDevice();
      const port = variablePort({
        device,
        values: [],
        uploadPath: () => Promise.resolve(null),
      });

      await expect(port.act(upload)).rejects.toThrow(
        '/qa/nota.pdf was not given to this run',
      );
      expect(typed).toEqual([]);
    });

    it('says a machine with no files of the QA has only samples', async () => {
      const { device, typed } = fakeDevice();
      const port = variablePort({ device, values: [] });

      await expect(port.act(upload)).rejects.toThrow("none of the QA's own files");
      expect(typed).toEqual([]);
    });

    it('leaves a sample alone', async () => {
      const { device, typed } = fakeDevice();
      const port = variablePort({ device, values: [] });

      await port.act({ kind: 'upload', target: 'Foto', value: 'image' });

      expect(typed[0]?.value).toBe('image');
    });
  });
});
