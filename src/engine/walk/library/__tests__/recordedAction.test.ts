import { describe, expect, it } from 'vitest';
import { recordedAction } from '@/engine/walk/library';

const VALUES = [{ name: 'LOGIN_EMAIL', description: '', value: 'qa@shop.test' }];
const FILL = { kind: 'fill', target: 'Email', value: '${LOGIN_EMAIL}' } as const;

describe('recordedAction', () => {
  it('keeps the variable as the agent wrote it, with the locator the run found', () => {
    expect(
      recordedAction({
        action: FILL,
        found: { locator: "getByLabel('Email')", toLocator: null, option: null },
        values: VALUES,
      }),
    ).toEqual({ ...FILL, locator: "getByLabel('Email')" });
  });

  it('keeps where a drag dropped and the option a dropdown took', () => {
    expect(
      recordedAction({
        action: { kind: 'drag', target: 'Card', value: 'Done' },
        found: {
          locator: "getByText('Card')",
          toLocator: "getByText('Done')",
          option: 'x',
        },
        values: VALUES,
      }),
    ).toEqual({
      kind: 'drag',
      target: 'Card',
      value: 'Done',
      locator: "getByText('Card')",
      toLocator: "getByText('Done')",
      option: 'x',
    });
  });

  it('does NOT keep a locator that holds a value, only the action', () => {
    expect(
      recordedAction({
        action: { kind: 'click', target: '${LOGIN_EMAIL}', value: '' },
        found: { locator: "getByText('qa@shop.test')", toLocator: null, option: null },
        values: VALUES,
      }),
    ).toEqual({ kind: 'click', target: '${LOGIN_EMAIL}', value: '' });
  });

  it('keeps the action alone when the device found nothing to say', () => {
    expect(recordedAction({ action: FILL, found: null, values: VALUES })).toEqual(FILL);
  });
});
