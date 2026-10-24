import { describe, expect, it } from 'vitest';
import { describeLook } from '@/context/library';

describe('describeLook', () => {
  it('hands the agent what the page read, line by line', () => {
    expect(
      describeLook({
        kind: 'web',
        where: 'https://rotuz.test/',
        isOpen: true,
        page: 'TITLE: Rotuz\nTEXT:\nThe score of what you eat',
      }).lines,
    ).toEqual([
      'QAzinho opened https://rotuz.test/ in a browser before this message, and the pages its menu leads to. They read:',
      'TITLE: Rotuz',
      'TEXT:',
      'The score of what you eat',
    ]);
  });

  it('says why the page did not open, so the agent asks instead of guessing', () => {
    expect(
      describeLook({
        kind: 'web',
        where: 'https://down.test/',
        isOpen: false,
        reason: 'net::ERR_NAME_NOT_RESOLVED',
      }).lines,
    ).toEqual([
      'QAzinho tried to open https://down.test/ before this message and could not: net::ERR_NAME_NOT_RESOLVED',
    ]);
  });

  /** On a phone the agent planned blind and asked about logins and fields the app did not have. */
  it("hands the agent a phone app's first screen, and says nothing beyond it was tapped", () => {
    expect(
      describeLook({
        kind: 'android',
        where: 'visitas.apk',
        isOpen: true,
        page: 'APP: app.qazinho.visitas\nTEXT:\nVisitas: 0',
      }).lines,
    ).toEqual([
      'QAzinho installed visitas.apk on an Android emulator before this message and opened it as on the day it was installed. Only its first screen was read, nothing was tapped:',
      'APP: app.qazinho.visitas',
      'TEXT:',
      'Visitas: 0',
    ]);
  });

  it('says why a phone app did not open', () => {
    expect(
      describeLook({
        kind: 'ios',
        where: 'Visitas.app',
        isOpen: false,
        reason: 'this machine has no iOS simulator with idb',
      }).lines,
    ).toEqual([
      'QAzinho tried to open Visitas.app on an iOS simulator before this message and could not: this machine has no iOS simulator with idb',
    ]);
  });

  it('adds nothing when QAzinho did not look', () => {
    expect(describeLook(null).lines).toEqual([]);
  });
});
