import {httpClient} from '../../../core/api/http-client';

export const applicationsApi = {
  async list(params?: {job_posting_id?: number | string}): Promise<unknown> {
    const response = await httpClient.get('/job-applications', {params});
    return response.data;
  },

  async create(payload: Record<string, unknown>): Promise<unknown> {
    const response = await httpClient.post('/job-applications', payload);
    return response.data;
  },

  async cancel(applicationId: number | string): Promise<void> {
    await httpClient.delete(`/job-applications/${applicationId}`);
  },

  async recruitmentProcess(applicantDataId: number | string): Promise<unknown> {
    const response = await httpClient.get(`/applicant-data/${applicantDataId}/recruitment-process`);
    return response.data;
  },
};
