import { describe, expect, it } from 'vitest';
import { describeExploration } from '@/context/library';

describe('describeExploration', () => {
  it('says how long to explore, and what the device shows to start from', () => {
    expect(
      describeExploration({
        minutes: 10,
        screen: 'Shop · [link] Cart',
        variables: [],
        known: [],
        design: null,
      }),
    ).toBe(
      [
        'Explore the app for 10 minutes: note each screen the first time you reach it, file what is wrong, and call finish before the time is up.',
        '',
        'The device shows right now:',
        'Shop · [link] Cart',
      ].join('\n'),
    );
  });

  it('names the Figma design the screens it reaches are held to', () => {
    expect(
      describeExploration({
        minutes: 10,
        screen: '',
        variables: [],
        known: [],
        design: {
          url: 'https://www.figma.com/design/AbC123/Shop?node-id=1-2',
          fileKey: 'AbC123',
          nodeId: '1:2',
          name: 'Shop',
        },
      }).split('\n')[1],
    ).toBe(
      'Figma design: https://www.figma.com/design/AbC123/Shop?node-id=1-2 (fileKey AbC123, node 1:2). Hold each screen it draws to its frame.',
    );
  });

  it('lists the variables the explorer may type', () => {
    expect(
      describeExploration({
        minutes: 5,
        screen: '',
        variables: [{ name: 'SHOP_EMAIL', description: 'The buyer' }],
        known: [],
        design: null,
      }),
    ).toContain(
      'Variables the project keeps, to type as written:\n- ${SHOP_EMAIL}: The buyer',
    );
  });
});
