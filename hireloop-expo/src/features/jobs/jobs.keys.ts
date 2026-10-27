import type {CandidateJobQuery, CandidateJobSource} from './jobs.types';

export const jobsKeys = {
  all: ['jobs'] as const,
  list: (params: CandidateJobQuery) => [...jobsKeys.all, 'list', params] as const,
  infinite: (params: Omit<CandidateJobQuery, 'page'>) => [...jobsKeys.all, 'infinite', params] as const,
  detail: (source: CandidateJobSource, jobId: number | string) => [...jobsKeys.all, 'detail', source, jobId] as const,
};
