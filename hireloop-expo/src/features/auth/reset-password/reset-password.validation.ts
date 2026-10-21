export type PasswordCriteria = {
  minimumLength: boolean;
  mixedCase: boolean;
  numberOrSymbol: boolean;
};

export function getPasswordCriteria(password: string): PasswordCriteria {
  return {
    minimumLength: password.length >= 8,
    mixedCase: /[a-z]/.test(password) && /[A-Z]/.test(password),
    numberOrSymbol: /[0-9\W_]/.test(password),
  };
}

export function isPasswordValid(password: string): boolean {
  return Object.values(getPasswordCriteria(password)).every(Boolean);
}

export function passwordsMatch(password: string, confirmation: string): boolean {
  return confirmation.length > 0 && password === confirmation;
}
