import {isCandidateTier2Banned} from '../candidate-apply-access';
import type {CandidateUser} from '../auth.types';

const candidate = (overrides: Partial<CandidateUser> = {}): CandidateUser => ({
  id: 1,
  full_name: 'Andi Pratama',
  email: 'andi@example.com',
  avatar_url: null,
  cover_url: null,
  profile_completed_at: null,
  is_verified: true,
  prod_candidate: true,
  onboarding_finished: true,
  role: 'user',
  roles: ['user'],
  job_applications: [],
  ...overrides,
});

describe('candidate apply access', () => {
  it('memblokir kandidat Tier 2 aktif dari seluruh variasi response backend', () => {
    expect(isCandidateTier2Banned(candidate({is_banned: true}))).toBe(true);
    expect(isCandidateTier2Banned(candidate({is_blacklisted: true, blacklist_tier: 'tier_2'}))).toBe(true);
    expect(isCandidateTier2Banned(candidate({
      blacklist_info: {
        id: 10,
        tier: 'tier_2',
        status: 'active',
        reason: null,
        notes: null,
        evidence_file_url: null,
        evidence_file_name: null,
        company_name: null,
        position_name: null,
        blacklisted_from: null,
        blacklisted_at: null,
        supervisor_validated_at: null,
        supervisor_notes: null,
      },
    }))).toBe(true);
  });

  it('tidak memblokir Tier 1 atau riwayat Tier 2 yang sudah tidak aktif', () => {
    expect(isCandidateTier2Banned(candidate({is_blacklisted: true, blacklist_tier: 'tier_1'}))).toBe(false);
    expect(isCandidateTier2Banned(candidate({
      blacklist_info: {
        id: 11,
        tier: 'tier_2',
        status: 'whitelisted',
        reason: null,
        notes: null,
        evidence_file_url: null,
        evidence_file_name: null,
        company_name: null,
        position_name: null,
        blacklisted_from: null,
        blacklisted_at: null,
        supervisor_validated_at: null,
        supervisor_notes: null,
      },
    }))).toBe(false);
  });
});
