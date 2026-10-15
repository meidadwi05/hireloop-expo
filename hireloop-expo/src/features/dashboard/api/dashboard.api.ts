import {httpClient} from '../../../core/api/http-client';
import {dashboardResponseSchema} from '../dashboard.schemas';
import type {CandidateDashboard} from '../dashboard.types';

export const dashboardApi = {
  async get(): Promise<CandidateDashboard> {
    const response = await httpClient.get('/user/dashboard');
    return dashboardResponseSchema.parse(response.data).data;
  },

  async getPerformance(): Promise<unknown> {
    const response = await httpClient.get('/job-seeker/performance');
    return response.data;
  },

  async getRecruitmentActivities(): Promise<unknown> {
    const response = await httpClient.get('/aktivitas-rekrutmen');
    return response.data;
  },
};
