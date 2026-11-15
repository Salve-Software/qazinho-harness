import type { ICaseRecipe, IFlatStep, ISignInRecipe } from '@/contract';
import { describe, expect, it } from 'vitest';
import {
  fingerprintOf,
  missingValuesOf,
  signedInAsOf,
  signInFor,
  withSignIn,
} from '@/engine/walk/library';
import { STEPS } from './fixtures';

const SIGNED: IFlatStep[] = STEPS.map((step) => ({
  ...step,
  casePreconditions: 'Logado como ${LOGIN_EMAIL}',
  caseSignedInAs: 'LOGIN_EMAIL',
}));

const SIGN_IN: ISignInRecipe = {
  account: 'LOGIN_EMAIL',
  actions: [{ kind: 'fill', target: 'E-mail', value: '${LOGIN_EMAIL}' }],
  proof: 'Sair',
};

const recipe = (overrides: Partial<ICaseRecipe> = {}): ICaseRecipe => ({
  caseId: 'TC-01',
  fingerprint: 'abc',
  targetKind: 'web',
  steps: [
    { number: 1, actions: [], proof: 'Visits: 1' },
    { number: 2, actions: [], proof: 'Visits: 1' },
  ],
  runId: 'r-1',
  recordedAt: 1,
  ...overrides,
});

describe('signedInAsOf', () => {
  it('reads the account a web case starts signed in with', () => {
    expect(signedInAsOf({ steps: SIGNED, targetKind: 'web' })).toBe('LOGIN_EMAIL');
  });

  it('is null on a phone, which signs in again in every case', () => {
    expect(signedInAsOf({ steps: SIGNED, targetKind: 'android' })).toBeNull();
    expect(signedInAsOf({ steps: SIGNED, targetKind: 'ios' })).toBeNull();
  });

  it('is null for a case that starts signed out, or names a blank account', () => {
    expect(signedInAsOf({ steps: STEPS, targetKind: 'web' })).toBeNull();
    expect(
      signedInAsOf({
        steps: STEPS.map((step) => ({ ...step, caseSignedInAs: '  ' })),
        targetKind: 'web',
      }),
    ).toBeNull();
  });
});

describe('signInFor', () => {
  it('takes the sign-in of the newest web recording that signed in with the account', () => {
    const older = { ...SIGN_IN, proof: 'Old' };
    const book = {
      cases: [
        withSignIn({ recipe: recipe({ recordedAt: 1 }), signIn: older }),
        withSignIn({
          recipe: recipe({ caseId: 'TC-02', recordedAt: 5 }),
          signIn: SIGN_IN,
        }),
      ],
    };

    expect(signInFor({ book, account: 'LOGIN_EMAIL' })).toEqual(SIGN_IN);
  });

  it('looks at the cases that stopped half way too', () => {
    const book = {
      cases: [],
      partial: [withSignIn({ recipe: recipe(), signIn: SIGN_IN })],
    };

    expect(signInFor({ book, account: 'LOGIN_EMAIL' })).toEqual(SIGN_IN);
  });

  it('does NOT take another account, a phone recording, or a sign-in with no proof', () => {
    const book = {
      cases: [
        withSignIn({ recipe: recipe(), signIn: { ...SIGN_IN, account: 'ADMIN_EMAIL' } }),
        withSignIn({ recipe: recipe({ targetKind: 'android' }), signIn: SIGN_IN }),
        withSignIn({ recipe: recipe(), signIn: { ...SIGN_IN, proof: '  ' } }),
      ],
    };

    expect(signInFor({ book, account: 'LOGIN_EMAIL' })).toBeNull();
  });
});

describe('withSignIn', () => {
  it('keeps the sign-in on the first step only', () => {
    const kept = withSignIn({ recipe: recipe(), signIn: SIGN_IN });

    expect(kept.steps[0]?.signIn).toEqual(SIGN_IN);
    expect(kept.steps[1]?.signIn).toBeUndefined();
  });

  it('leaves a recording as it was without a sign-in', () => {
    const plain = recipe();

    expect(withSignIn({ recipe: plain, signIn: null })).toBe(plain);
  });
});

describe('fingerprintOf with an account', () => {
  it('changes when the case starts signed in, so a recording that signed in by itself is not replayed', () => {
    expect(fingerprintOf({ targetKind: 'web', steps: SIGNED })).not.toBe(
      fingerprintOf({
        targetKind: 'web',
        steps: SIGNED.map(({ caseSignedInAs: _, ...step }) => step),
      }),
    );
  });

  it('does NOT change for a case without an account, so older recordings still hold', () => {
    expect(fingerprintOf({ targetKind: 'web', steps: STEPS })).toBe(
      fingerprintOf({
        targetKind: 'web',
        steps: STEPS.map((step) => ({ ...step, caseSignedInAs: undefined })),
      }),
    );
  });
});

describe('missingValuesOf with an account', () => {
  it('names the account a case starts in when the run has no value for it', () => {
    expect(missingValuesOf({ steps: SIGNED, values: [] })).toEqual(['LOGIN_EMAIL']);
    expect(missingValuesOf({ steps: SIGNED, values: [{ name: 'LOGIN_EMAIL' }] })).toEqual(
      [],
    );
  });
});
