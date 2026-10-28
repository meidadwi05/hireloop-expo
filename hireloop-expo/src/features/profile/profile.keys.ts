export const profileKeys = {
  all: ['candidate-profile'] as const,
  detail: () => [...profileKeys.all, 'detail'] as const,
  files: () => [...profileKeys.all, 'files'] as const,
};
