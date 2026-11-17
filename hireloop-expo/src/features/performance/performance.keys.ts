export const performanceKeys = {
  all: ['performance'] as const,
  list: () => [...performanceKeys.all, 'list'] as const,
};

