import {httpClient} from '../../../core/api/http-client';
import {
  googleAuthorizationResponseSchema,
  googleExchangeResponseSchema,
} from '../auth.schemas';
import type {AuthClientType} from './auth.api';

export const googleAuthApi = {
  async getAuthorizationUrl(returnUrl: string, clientType: AuthClientType): Promise<string> {
    const response = await httpClient.get('/google/mobile/redirect', {
      params: {return_url: returnUrl, client_type: clientType},
    });

    return googleAuthorizationResponseSchema.parse(response.data).url;
  },

  async exchangeCode(code: string): Promise<string> {
    const response = await httpClient.post('/google/mobile/exchange', {code});
    return googleExchangeResponseSchema.parse(response.data).token;
  },
};
