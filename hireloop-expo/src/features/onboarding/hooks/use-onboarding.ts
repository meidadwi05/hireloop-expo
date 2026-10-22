import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';

import {toAppApiError} from '../../../core/api/api-error';
import {masterDataApi} from '../../master-data/api/master-data.api';
import {onboardingApi} from '../api/onboarding.api';
import {normalizeSkillOptions, toOnboardingPayload} from '../onboarding.mapper';
import {onboardingKeys} from '../onboarding.keys';
import type {OnboardingDraft} from '../onboarding.types';

export function useOnboarding(refreshUser: () => Promise<unknown>) {
  const queryClient = useQueryClient();
  const current = useQuery({
    queryKey: onboardingKeys.current(),
    queryFn: onboardingApi.getCurrent,
    retry: false,
  });
  const skills = useQuery({
    queryKey: onboardingKeys.skills(),
    queryFn: async () => normalizeSkillOptions(await masterDataApi.list('skills')),
    staleTime: 30 * 60 * 1000,
  });
  const majors = useQuery({
    queryKey: onboardingKeys.majors(),
    queryFn: () => masterDataApi.list('majors'),
    staleTime: 30 * 60 * 1000,
  });
  const submit = useMutation({
    mutationFn: async (draft: OnboardingDraft) => onboardingApi.complete(toOnboardingPayload(draft)),
  });

  return {
    current,
    skills,
    majors,
    submit: async (draft: OnboardingDraft) => {
      try {
        return await submit.mutateAsync(draft);
      } catch (error) {
        throw toAppApiError(error);
      }
    },
    submitting: submit.isPending,
    refreshAfterSubmit: async () => {
      await queryClient.invalidateQueries({queryKey: onboardingKeys.all});
      return refreshUser();
    },
  };
}
