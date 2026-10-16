import {toAppApiError} from '../../core/api/api-error';

export type AuthErrorStage =
  | 'login'
  | 'google-start'
  | 'google-browser'
  | 'google-callback'
  | 'google-exchange'
  | 'token-storage'
  | 'current-user'
  | 'candidate-role';

export class AuthFlowError extends Error {
  constructor(
    public readonly stage: AuthErrorStage,
    public readonly originalError: unknown,
  ) {
    super(`Authentication failed during ${stage}.`);
    this.name = 'AuthFlowError';
  }
}

export function isAuthFlowError(error: unknown): error is AuthFlowError {
  return error instanceof AuthFlowError;
}

type LoginErrorMessageOptions = {
  apiUrl?: string;
  isDevelopment?: boolean;
};

function firstValidationMessage(errors: Record<string, string[]>): string | undefined {
  return Object.values(errors).flat().find(Boolean);
}

export function getLoginErrorMessage(
  error: unknown,
  options: LoginErrorMessageOptions = {},
): string {
  const flowError = isAuthFlowError(error) ? error : new AuthFlowError('login', error);
  const apiError = toAppApiError(flowError.originalError);

  if (flowError.stage === 'token-storage') {
    return 'Login berhasil, tetapi sesi tidak dapat disimpan di perangkat.';
  }

  if (flowError.stage === 'candidate-role') {
    return 'Akun ini tidak memiliki akses sebagai kandidat.';
  }

  if (apiError.isNetworkError) {
    const endpoint = options.isDevelopment && options.apiUrl ? ` (${options.apiUrl})` : '';
    return flowError.stage === 'current-user'
      ? `Login berhasil, tetapi profil kandidat tidak dapat diverifikasi${endpoint}.`
      : `Tidak dapat terhubung ke server HireLoop${endpoint}.`;
  }

  if (flowError.stage === 'current-user') {
    if (apiError.status === 401) {
      return 'Login berhasil, tetapi token ditolak oleh server. Silakan masuk kembali.';
    }

    if (apiError.status === 403) {
      return 'Login berhasil, tetapi akun tidak memiliki akses kandidat.';
    }

    if (apiError.status === null) {
      return 'Login berhasil, tetapi format profil kandidat dari server tidak sesuai.';
    }

    return `Login berhasil, tetapi profil kandidat gagal dimuat: ${apiError.message}`;
  }

  if (apiError.status === 401) return 'Email atau kata sandi salah.';
  if (apiError.status === 403) return 'Akun belum diverifikasi.';
  if (apiError.status === 422) {
    return firstValidationMessage(apiError.validationErrors) ?? apiError.message;
  }
  if (apiError.status === null) return 'Format respons login dari server tidak sesuai.';

  return apiError.message;
}

export function getGoogleLoginErrorMessage(
  error: unknown,
  options: LoginErrorMessageOptions = {},
): string {
  const flowError = isAuthFlowError(error) ? error : new AuthFlowError('google-start', error);

  if (
    flowError.stage === 'google-browser'
    && flowError.originalError instanceof Error
    && flowError.originalError.message === 'expo-go-unsupported'
  ) {
    return 'Login Google memerlukan development build atau APK HireLoop, bukan Expo Go.';
  }

  if (flowError.stage === 'google-callback') {
    const callbackError = flowError.originalError instanceof Error
      ? flowError.originalError.message
      : '';

    if (callbackError === 'candidate_access_denied') {
      return 'Akun Google ini tidak memiliki akses sebagai kandidat.';
    }
    if (callbackError === 'invalid_state') {
      return 'Sesi Google Login sudah kedaluwarsa. Silakan coba lagi.';
    }
    return 'Google Login dibatalkan atau gagal diselesaikan.';
  }

  if (['token-storage', 'current-user', 'candidate-role'].includes(flowError.stage)) {
    return getLoginErrorMessage(flowError, options);
  }

  const apiError = toAppApiError(flowError.originalError);
  if (apiError.isNetworkError) {
    const endpoint = options.isDevelopment && options.apiUrl ? ` (${options.apiUrl})` : '';
    return `Tidak dapat terhubung ke layanan Google HireLoop${endpoint}.`;
  }
  if (apiError.status === 403) return 'Akun Google ini tidak memiliki akses sebagai kandidat.';
  if (apiError.status === 422) {
    return firstValidationMessage(apiError.validationErrors) ?? apiError.message;
  }
  if (apiError.status === null) return 'Format respons Google Login dari server tidak sesuai.';

  return apiError.message;
}
