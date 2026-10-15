import {httpClient} from '../../../core/api/http-client';

export const profileApi = {
  async get(): Promise<unknown> {
    const response = await httpClient.get('/job-seeker/profile');
    return response.data;
  },

  async updatePersonalInfo(payload: Record<string, unknown>): Promise<unknown> {
    const response = await httpClient.put('/job-seeker/personal-info', payload);
    return response.data;
  },

  async updateDescription(payload: Record<string, unknown>): Promise<unknown> {
    const response = await httpClient.put('/job-seeker/self-description', payload);
    return response.data;
  },

  async updateWorkPreferences(payload: Record<string, unknown>): Promise<unknown> {
    const response = await httpClient.put('/job-seeker/work-preferences', payload);
    return response.data;
  },

  async uploadAvatar(file: FormData): Promise<unknown> {
    const response = await httpClient.post('/job-seeker/avatar', file, {
      headers: {'Content-Type': 'multipart/form-data'},
    });
    return response.data;
  },
};
