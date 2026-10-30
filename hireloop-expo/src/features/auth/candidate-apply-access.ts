import type {CandidateUser} from './auth.types';

export function isCandidateTier2Banned(user: CandidateUser | null | undefined): boolean {
  if (!user) return false;

  return Boolean(
    user.is_banned
    || (user.is_blacklisted && user.blacklist_tier === 'tier_2')
    || (
      user.blacklist_info?.tier === 'tier_2'
      && user.blacklist_info.status === 'active'
    ),
  );
}
