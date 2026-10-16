import {AxiosError, InternalAxiosRequestConfig, create} from 'axios';

import {tokenStorage} from '../../api/tokenStorage';
import {requireApiUrl} from '../config/env';
import {shouldAttemptTokenRefresh} from './http-refresh-policy';

type RetryableRequest = InternalAxiosRequestConfig & {_retry?: boolean};
type UnauthorizedListener = () => void;

let refreshPromise: Promise<string> | null = null;
const unauthorizedListeners = new Set<UnauthorizedListener>();
const baseURL = requireApiUrl();

export const httpClient = create({
  baseURL,
  timeout: 15_000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

const refreshClient = create({
  baseURL,
  timeout: 15_000,
  headers: {Accept: 'application/json'},
});

function notifyUnauthorized() {
  unauthorizedListeners.forEach(listener => listener());
}

async function refreshAccessToken(currentToken: string): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const response = await refreshClient.post<{token: string}>(
        '/auth/refresh',
        undefined,
        {headers: {Authorization: `Bearer ${currentToken}`}},
      );

      await tokenStorage.replace(response.data.token);
      return response.data.token;
    })().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

httpClient.interceptors.request.use(async config => {
  const token = await tokenStorage.get();

  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

httpClient.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const request = error.config as RetryableRequest | undefined;

    if (
      !shouldAttemptTokenRefresh({
        hasRequest: Boolean(request),
        retried: Boolean(request?._retry),
        status: error.response?.status,
        url: request?.url,
      }) ||
      !request
    ) {
      return Promise.reject(error);
    }

    const currentToken = await tokenStorage.get();
    if (!currentToken) return Promise.reject(error);

    request._retry = true;

    try {
      const token = await refreshAccessToken(currentToken);
      request.headers.Authorization = `Bearer ${token}`;
      return await httpClient.request(request);
    } catch (refreshError) {
      await tokenStorage.remove();
      notifyUnauthorized();
      return Promise.reject(refreshError);
    }
  },
);

export function subscribeUnauthorized(listener: UnauthorizedListener): () => void {
  unauthorizedListeners.add(listener);
  return () => unauthorizedListeners.delete(listener);
}
