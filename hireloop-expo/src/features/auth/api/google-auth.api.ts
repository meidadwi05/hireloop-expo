import {httpClient} from '../../../core/api/http-client';
import {
  googleAuthorizationResponseSchema,
  googleExchangeResponseSchema,
} from '../auth.schemas';

export const googleAuthApi = {
  async getAuthorizationUrl(returnUrl: string): Promise<string> {
    const response = await httpClient.get('/google/mobile/redirect', {
      params: {return_url: returnUrl},
    });

    return googleAuthorizationResponseSchema.parse(response.data).url;
  },

  async exchangeCode(code: string): Promise<string> {
    const response = await httpClient.post('/google/mobile/exchange', {code});
    return googleExchangeResponseSchema.parse(response.data).token;
  },
};
