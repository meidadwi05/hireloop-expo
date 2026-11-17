import {httpClient} from '../../../core/api/http-client';
import {performanceResponseSchema, type PerformanceResponse} from '../performance.schemas';

export const performanceApi = {
  async get(): Promise<PerformanceResponse> {
    const response = await httpClient.get('/job-seeker/performance');
    return performanceResponseSchema.parse(response.data);
  },
};

