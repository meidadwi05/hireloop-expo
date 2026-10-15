import {httpClient} from '../../../core/api/http-client';

export const onboardingApi = {
  async getCurrent(): Promise<unknown> {
    const response = await httpClient.get('/onboarding/me');
    return response.data;
  },

  async submitStep(step: 1 | 2 | 3, payload: Record<string, unknown>): Promise<unknown> {
    const response = await httpClient.post(`/onboarding/step-${step}`, payload);
    return response.data;
  },

  async chooseCategory(payload: Record<string, unknown>): Promise<unknown> {
    const response = await httpClient.post('/onboarding/choose-category', payload);
    return response.data;
  },

  async submitProductionStep(step: 1 | 2 | 3 | 4, payload: Record<string, unknown>): Promise<unknown> {
    const response = await httpClient.post(`/prod-candidate/onboarding/step-${step}`, payload);
    return response.data;
  },
};
