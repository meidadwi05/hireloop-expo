export const onboardingKeys = {
  all: ['onboarding'] as const,
  current: () => [...onboardingKeys.all, 'current'] as const,
  skills: () => [...onboardingKeys.all, 'skills'] as const,
  majors: () => [...onboardingKeys.all, 'majors'] as const,
  regions: (level: string, parent = '') => [...onboardingKeys.all, 'regions', level, parent] as const,
};
