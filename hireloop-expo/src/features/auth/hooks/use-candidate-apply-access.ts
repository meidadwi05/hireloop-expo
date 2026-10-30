import {useQuery} from '@tanstack/react-query';

import {authApi} from '../api/auth.api';
import {useAuth} from '../auth-provider';
import {isCandidateTier2Banned} from '../candidate-apply-access';

export const candidateApplyAccessKey = ['auth', 'candidate-apply-access'] as const;

export function useCandidateApplyAccess() {
  const {user} = useAuth();
  const candidate = useQuery({
    queryKey: candidateApplyAccessKey,
    queryFn: authApi.getCurrentUser,
    initialData: user ?? undefined,
    staleTime: 30_000,
  });
  const currentUser = candidate.data ?? user;

  return {
    candidate: currentUser,
    blacklistInfo: currentUser?.blacklist_info ?? null,
    isTier2Banned: isCandidateTier2Banned(currentUser),
    isError: candidate.isError,
    isRefetching: candidate.isRefetching,
    refetch: candidate.refetch,
  };
}
