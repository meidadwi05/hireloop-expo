import {httpClient} from '../../../core/api/http-client';
import {mapCandidateJobsPage, mapJobDetail} from '../jobs.mapper';
import {candidateJobsResponseSchema} from '../jobs.schemas';
import type {
  ApplyCandidateJobPayload,
  CandidateJobDetail,
  CandidateJobQuery,
  CandidateJobSource,
  CandidateJobsPage,
  JobCardModel,
} from '../jobs.types';

export const jobsApi = {
  async listPage(params: CandidateJobQuery = {}): Promise<CandidateJobsPage> {
    const response = await httpClient.get('/candidate-job-listings', {params});
    const parsed = candidateJobsResponseSchema.parse(response.data);
    return mapCandidateJobsPage(parsed);
  },

  /** Keeps older dashboard consumers compatible while the jobs screen uses page metadata. */
  async list(params: CandidateJobQuery = {}): Promise<JobCardModel[]> {
    const page = await jobsApi.listPage(params);
    return page.items;
  },

  async publicList(params: CandidateJobQuery = {}): Promise<unknown> {
    const response = await httpClient.get('/job-postings', {params});
    return response.data;
  },

  async detail(source: CandidateJobSource, jobId: number | string): Promise<CandidateJobDetail> {
    const endpoint = source === 'project-lowongan'
      ? `/project-lowongan/${jobId}`
      : `/job-postings/${jobId}`;
    const response = await httpClient.get(endpoint);
    return mapJobDetail(response.data, source);
  },

  async apply(payload: ApplyCandidateJobPayload): Promise<unknown> {
    const response = await httpClient.post('/applicant-data', payload);
    return response.data;
  },
};
