import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';

import {toAppApiError} from '../../../core/api/api-error';
import {masterDataApi} from '../../master-data/api/master-data.api';
import {onboardingApi} from '../api/onboarding.api';
import {
  normalizeExperienceOptions,
  normalizeSkillOptions,
  toOnboardingPayload,
  toProductionPersonalPayload,
  toProductionWorkPayload,
  toRegularEducationPayload,
  toRegularPersonalPayload,
} from '../onboarding.mapper';
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
  const experiences = useQuery({
    queryKey: onboardingKeys.experiences(),
    queryFn: async () => normalizeExperienceOptions(await masterDataApi.list('experience-list')),
    staleTime: 30 * 60 * 1000,
  });
  const savePersonal = useMutation({
    mutationFn: async ({draft, production}: {draft: OnboardingDraft; production: boolean}) => {
      if (production) return onboardingApi.submitProductionStep(1, toProductionPersonalPayload(draft));
      await onboardingApi.submitStep(1, toRegularPersonalPayload(draft));
      return onboardingApi.submitStep(2, toRegularEducationPayload(draft));
    },
  });
  const submit = useMutation({
    mutationFn: async ({draft, production}: {draft: OnboardingDraft; production: boolean}) => production
      ? onboardingApi.submitProductionStep(4, toProductionWorkPayload(draft))
      : onboardingApi.complete(toOnboardingPayload(draft)),
  });

  return {
    current,
    skills,
    majors,
    experiences,
    savePersonal: async (draft: OnboardingDraft, production: boolean) => {
      try {
        return await savePersonal.mutateAsync({draft, production});
      } catch (error) {
        throw toAppApiError(error);
      }
    },
    submit: async (draft: OnboardingDraft, production: boolean) => {
      try {
        return await submit.mutateAsync({draft, production});
      } catch (error) {
        throw toAppApiError(error);
      }
    },
    submitting: savePersonal.isPending || submit.isPending,
    refreshAfterSubmit: async () => {
      await queryClient.invalidateQueries({queryKey: onboardingKeys.all});
      return refreshUser();
    },
  };
}
