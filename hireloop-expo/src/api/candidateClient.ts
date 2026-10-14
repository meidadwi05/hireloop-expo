import axios from 'axios';

import {tokenStorage} from './tokenStorage';

const baseURL = process.env.EXPO_PUBLIC_API_URL?.trim();

if (!baseURL) {
  console.warn(
    'EXPO_PUBLIC_API_URL belum dikonfigurasi. Tambahkan nilainya ke .env.local.',
  );
}

export const candidateClient = axios.create({
  baseURL,
  timeout: 15_000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

candidateClient.interceptors.request.use(async config => {
  if (!baseURL) {
    throw new Error('EXPO_PUBLIC_API_URL belum dikonfigurasi.');
  }

  const token = await tokenStorage.get();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

candidateClient.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      await tokenStorage.remove();
    }

    return Promise.reject(error);
  },
);
