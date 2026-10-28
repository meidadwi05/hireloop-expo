export const applicationsKeys = {
  all: ['applications'] as const,
  list: () => [...applicationsKeys.all, 'list'] as const,
  process: (id: number | string) => [...applicationsKeys.all, 'process', id] as const,
  detail: (source: string, id: number | string) => [...applicationsKeys.all, 'detail', source, id] as const,
};
