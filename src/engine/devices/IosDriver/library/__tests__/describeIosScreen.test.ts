import { describe, expect, it } from 'vitest';
import { describeIosScreen } from '@/engine/devices/IosDriver/library';

const ELEMENTS = [
  {
    label: 'Settings',
    role: 'StaticText',
    x: 10,
    y: 10,
    isLaunchIcon: false,
    box: { x: 0, y: 0, width: 10, height: 10 },
  },
  {
    label: 'Wi-Fi',
    role: 'Button',
    x: 20,
    y: 20,
    isLaunchIcon: false,
    box: { x: 0, y: 0, width: 10, height: 10 },
  },
  {
    label: '',
    role: 'Other',
    x: 30,
    y: 30,
    isLaunchIcon: false,
    box: { x: 0, y: 0, width: 10, height: 10 },
  },
];

describe('describeIosScreen', () => {
  it('says which app is in front and what it reads', () => {
    const said = describeIosScreen({ elements: ELEMENTS, app: 'com.apple.Preferences' });

    expect(said).toContain('APP: com.apple.Preferences');
    expect(said).toContain('Wi-Fi');
    expect(said).toContain('button: Wi-Fi');
  });

  it('leaves out what has nothing written on it', () => {
    const said = describeIosScreen({ elements: ELEMENTS, app: 'com.example' });

    expect(said).not.toContain('other:');
  });

  /** Um app que não conseguiu abrir deixava a tela inicial, lida como se fosse o app. */
  it('says the home screen is the home screen, and that the app is not open', () => {
    expect(
      describeIosScreen({
        elements: [
          {
            label: 'Safari',
            role: 'Button',
            x: 10,
            y: 10,
            isLaunchIcon: true,
            box: { x: 0, y: 0, width: 10, height: 10 },
          },
        ],
        app: 'app.qazinho.fixture',
      }).split('\n')[0],
    ).toBe('APP: the home screen, app.qazinho.fixture is not open');
  });

  it('an empty screen is still described, so the agent knows it is empty', () => {
    expect(describeIosScreen({ elements: [], app: 'com.example' })).toBe(
      'APP: com.example\nTEXT:\n\nCONTROLS:',
    );
  });
});
