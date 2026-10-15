import type {CandidateJobQuery} from './jobs.types';

export const jobsKeys = {
  all: ['jobs'] as const,
  list: (params: CandidateJobQuery) => [...jobsKeys.all, 'list', params] as const,
  detail: (jobId: number | string) => [...jobsKeys.all, 'detail', jobId] as const,
};
