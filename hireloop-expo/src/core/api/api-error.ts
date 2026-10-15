import {isAxiosError} from 'axios';

import type {LaravelValidationErrors} from './api-response';

export type AppApiError = {
  status: number | null;
  code: string | null;
  message: string;
  validationErrors: LaravelValidationErrors;
  isNetworkError: boolean;
};

export function toAppApiError(error: unknown): AppApiError {
  if (!isAxiosError(error)) {
    return {
      status: null,
      code: null,
      message: error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak diketahui.',
      validationErrors: {},
      isNetworkError: false,
    };
  }

  const data = error.response?.data as {
    message?: string;
    errors?: LaravelValidationErrors;
  } | undefined;

  return {
    status: error.response?.status ?? null,
    code: error.code ?? null,
    message: data?.message
      ?? (error.response ? 'Permintaan tidak dapat diproses.' : 'Tidak dapat terhubung ke server HireLoop.'),
    validationErrors: data?.errors ?? {},
    isNetworkError: !error.response,
  };
}
