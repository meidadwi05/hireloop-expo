import {httpClient} from '../../../core/api/http-client';

type MasterEndpoint = 'domains' | 'roles' | 'job-roles' | 'skills' | 'majors' | 'languages' | 'job-categories' | 'experience-list';

export const masterDataApi = {
  async list(endpoint: MasterEndpoint): Promise<unknown> {
    const response = await httpClient.get(`/${endpoint}`);
    return response.data;
  },

  async provinces(): Promise<unknown> {
    const response = await httpClient.get('/regions/provinces');
    return response.data;
  },

  async regencies(provinceCode: string): Promise<unknown> {
    const response = await httpClient.get(`/regions/regencies/${provinceCode}`);
    return response.data;
  },
};
