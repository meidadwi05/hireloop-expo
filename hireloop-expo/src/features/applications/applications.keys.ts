export const applicationsKeys = {
  all: ['applications'] as const,
  list: (params?: {job_posting_id?: number | string}) => [...applicationsKeys.all, 'list', params ?? {}] as const,
  process: (id: number | string) => [...applicationsKeys.all, 'process', id] as const,
};
