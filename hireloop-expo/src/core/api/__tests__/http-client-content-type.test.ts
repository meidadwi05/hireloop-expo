import type {AxiosAdapter, InternalAxiosRequestConfig} from 'axios';

import {httpClient} from '../http-client';

jest.mock('../../config/env', () => ({
  requireApiUrl: () => 'https://example.test/api',
}));

jest.mock('../../../api/tokenStorage', () => ({
  tokenStorage: {get: jest.fn(), remove: jest.fn(), replace: jest.fn()},
}));

describe('httpClient content type defaults', () => {
  function captureAdapter(configs: InternalAxiosRequestConfig[]): AxiosAdapter {
    return async config => {
      configs.push(config);
      return {config, data: {}, headers: {}, status: 200, statusText: 'OK'};
    };
  }

  it('does not globally force application/json so FormData can receive a multipart boundary', () => {
    expect(httpClient.defaults.headers.common['Content-Type']).toBeUndefined();
    expect(httpClient.defaults.headers.post?.['Content-Type']).toBeUndefined();
  });

  it('keeps JSON automatic while removing a forced JSON header from FormData', async () => {
    const configs: InternalAxiosRequestConfig[] = [];
    const adapter = captureAdapter(configs);

    await httpClient.post('/json', {name: 'HireLoop'}, {adapter});
    const formData = new FormData();
    formData.append('image', 'binary-placeholder');
    await httpClient.post('/upload', formData, {
      adapter,
      headers: {'Content-Type': 'application/json'},
    });

    expect(configs[0].headers.get('Content-Type')).toBe('application/json');
    expect(configs[1].headers.get('Content-Type')).not.toBe('application/json');
    expect(configs[1].data).toBe(formData);
  });
});
