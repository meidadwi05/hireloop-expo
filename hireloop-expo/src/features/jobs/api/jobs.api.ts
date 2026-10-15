import {httpClient} from '../../../core/api/http-client';
import {mapJobCard} from '../jobs.mapper';
import type {CandidateJobQuery, JobCardModel} from '../jobs.types';

function responseItems(payload: unknown): unknown[] {
  if (!payload || typeof payload !== 'object') return [];
  const data = (payload as {data?: unknown}).data;
  return Array.isArray(data) ? data : [];
}

export const jobsApi = {
  async list(params: CandidateJobQuery = {}): Promise<JobCardModel[]> {
    const response = await httpClient.get('/candidate-job-listings', {params});
    return responseItems(response.data).map(mapJobCard);
  },

  async publicList(params: CandidateJobQuery = {}): Promise<unknown> {
    const response = await httpClient.get('/job-postings', {params});
    return response.data;
  },

  async detail(jobId: number | string): Promise<unknown> {
    const response = await httpClient.get(`/job-postings/${jobId}`);
    return response.data;
  },
};
