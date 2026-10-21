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
