export const profileKeys = {
  all: ['candidate-profile'] as const,
  detail: () => [...profileKeys.all, 'detail'] as const,
  files: () => [...profileKeys.all, 'files'] as const,
  experiences: () => [...profileKeys.all, 'experiences'] as const,
  tools: () => [...profileKeys.all, 'tools'] as const,
  languages: () => [...profileKeys.all, 'languages'] as const,
};
