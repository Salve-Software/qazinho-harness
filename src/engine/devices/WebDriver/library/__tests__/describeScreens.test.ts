import { describe, expect, it } from 'vitest';
import { describeScreens } from '@/engine/devices/WebDriver/library/describeScreens';

const screen = (props: { id: number; isAgent: boolean; account?: number }) => ({
  id: props.id,
  url: `http://shop.test/${String(props.id)}`,
  isAgent: props.isAgent,
  account: props.account ?? 1,
});

describe('describeScreens', () => {
  it('says nothing about a single screen', () => {
    expect(describeScreens([screen({ id: 1, isAgent: true })])).toBeNull();
  });

  it('lists the screens and points at the one the agent is on', () => {
    const told = describeScreens([
      screen({ id: 1, isAgent: false }),
      screen({ id: 2, isAgent: true }),
    ]);

    expect(told).toContain('SCREENS (2 open');
    expect(told).toContain('2: http://shop.test/2 <- you are here');
    expect(told).not.toContain('account');
  });

  it('names the account of each screen when there is more than one', () => {
    expect(
      describeScreens([
        screen({ id: 1, isAgent: true }),
        screen({ id: 2, isAgent: false, account: 2 }),
      ]),
    ).toContain('2: http://shop.test/2 (account 2)');
  });
});
