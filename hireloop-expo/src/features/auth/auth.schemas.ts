import {z} from 'zod';

export const candidateUserSchema = z.object({
  id: z.number(),
  full_name: z.string(),
  email: z.string(),
  avatar_url: z.string().nullable().default(null),
  cover_url: z.string().nullable().default(null),
  profile_completed_at: z.string().nullable().default(null),
  is_verified: z.boolean(),
  prod_candidate: z.boolean(),
  onboarding_finished: z.boolean(),
  role: z.string().nullable(),
  roles: z.array(z.string()),
  job_applications: z.array(z.record(z.string(), z.unknown())).default([]),
});

export const loginResponseSchema = z.object({
  success: z.boolean(),
  token: z.string().min(1),
});

export const googleAuthorizationResponseSchema = z.object({
  success: z.literal(true),
  url: z.url(),
});

export const googleExchangeResponseSchema = z.object({
  success: z.literal(true),
  token: z.string().min(1),
});

export const authMessageResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
});

export const verifyOtpResponseSchema = authMessageResponseSchema.extend({
  token: z.string().min(1),
});

export const currentUserResponseSchema = z.object({
  success: z.boolean(),
  data: candidateUserSchema,
});
