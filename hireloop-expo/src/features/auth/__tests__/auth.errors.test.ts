import {AuthFlowError, getGoogleLoginErrorMessage, getLoginErrorMessage} from '../auth.errors';

function axiosError(status?: number, data?: unknown) {
  return {
    isAxiosError: true,
    message: 'Request failed',
    response: status ? {status, data} : undefined,
  };
}

describe('getLoginErrorMessage', () => {
  it('distinguishes invalid credentials from a rejected current-user token', () => {
    expect(getLoginErrorMessage(new AuthFlowError('login', axiosError(401)))).toBe(
      'Email atau kata sandi salah.',
    );
    expect(getLoginErrorMessage(new AuthFlowError('current-user', axiosError(401)))).toBe(
      'Login berhasil, tetapi token ditolak oleh server. Silakan masuk kembali.',
    );
  });

  it('shows the first Laravel validation message', () => {
    const error = axiosError(422, {
      message: 'Validation errors',
      errors: {email: ['Format email tidak valid.']},
    });
    expect(getLoginErrorMessage(new AuthFlowError('login', error))).toBe('Format email tidak valid.');
  });

  it('includes the active API only for development network diagnostics', () => {
    const error = new AuthFlowError('login', axiosError());
    expect(getLoginErrorMessage(error, {
      apiUrl: 'http://192.168.0.109:8000/api',
      isDevelopment: true,
    })).toContain('http://192.168.0.109:8000/api');
    expect(getLoginErrorMessage(error, {
      apiUrl: 'https://hireloop.superapp-provenforceindonesia.com/api',
      isDevelopment: false,
    })).not.toContain('superapp-provenforceindonesia.com');
  });

  it('reports storage and candidate-role failures explicitly', () => {
    expect(getLoginErrorMessage(new AuthFlowError('token-storage', new Error()))).toContain(
      'sesi tidak dapat disimpan',
    );
    expect(getLoginErrorMessage(new AuthFlowError('candidate-role', new Error()))).toBe(
      'Akun ini tidak memiliki akses sebagai kandidat.',
    );
  });
});

describe('getGoogleLoginErrorMessage', () => {
  it('explains that Expo Go cannot complete a stable OAuth redirect', () => {
    expect(getGoogleLoginErrorMessage(
      new AuthFlowError('google-browser', new Error('expo-go-unsupported')),
    )).toContain('development build');
  });

  it('maps invalid state and candidate access errors', () => {
    expect(getGoogleLoginErrorMessage(
      new AuthFlowError('google-callback', new Error('invalid_state')),
    )).toContain('kedaluwarsa');
    expect(getGoogleLoginErrorMessage(
      new AuthFlowError('google-callback', new Error('candidate_access_denied')),
    )).toContain('akses sebagai kandidat');
  });
});
