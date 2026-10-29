export type CandidateBlacklistInfo = {
  id: number;
  tier: 'tier_1' | 'tier_2';
  status: string;
  reason: string | null;
  notes: string | null;
  evidence_file_url: string | null;
  evidence_file_name: string | null;
  company_name: string | null;
  position_name: string | null;
  blacklisted_from: string | null;
  blacklisted_at: string | null;
  supervisor_validated_at: string | null;
  supervisor_notes: string | null;
};

export type CandidateUser = {
  id: number;
  full_name: string;
  email: string;
  avatar_url: string | null;
  cover_url: string | null;
  profile_completed_at: string | null;
  is_verified: boolean;
  prod_candidate: boolean;
  onboarding_finished: boolean;
  role: string | null;
  roles: string[];
  job_applications: Record<string, unknown>[];
  is_blacklisted?: boolean;
  is_banned?: boolean;
  blacklist_tier?: 'tier_1' | 'tier_2' | null;
  blacklist_info?: CandidateBlacklistInfo | null;
};

export type LoginInput = {
  email: string;
  password: string;
  remember: boolean;
};

export type RegisterInput = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  passwordConfirmation: string;
};

export type ResetPasswordInput = {
  email: string;
  token: string;
  password: string;
  passwordConfirmation: string;
};
