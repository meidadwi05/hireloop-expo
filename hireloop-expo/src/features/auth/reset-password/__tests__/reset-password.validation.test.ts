import {
  getPasswordCriteria,
  isPasswordValid,
  passwordsMatch,
} from '../reset-password.validation';

describe('reset password validation', () => {
  it('requires length, mixed case, and a number or symbol', () => {
    expect(getPasswordCriteria('Hireloop1')).toEqual({
      minimumLength: true,
      mixedCase: true,
      numberOrSymbol: true,
    });
    expect(isPasswordValid('Hireloop!')).toBe(true);
    expect(isPasswordValid('hireloop1')).toBe(false);
    expect(isPasswordValid('Hireloop')).toBe(false);
  });

  it('requires a non-empty matching confirmation', () => {
    expect(passwordsMatch('Hireloop1', 'Hireloop1')).toBe(true);
    expect(passwordsMatch('Hireloop1', '')).toBe(false);
    expect(passwordsMatch('Hireloop1', 'Hireloop2')).toBe(false);
  });
});
