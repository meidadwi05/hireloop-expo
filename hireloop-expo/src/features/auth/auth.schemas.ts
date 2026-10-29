import {z} from 'zod';

const candidateBlacklistInfoSchema = z.object({
  id: z.coerce.number().int().positive(),
  tier: z.enum(['tier_1', 'tier_2']),
  status: z.string().default('active'),
  reason: z.string().nullable().default(null),
  notes: z.string().nullable().default(null),
  evidence_file_url: z.string().nullable().default(null),
  evidence_file_name: z.string().nullable().default(null),
  company_name: z.string().nullable().default(null),
  position_name: z.string().nullable().default(null),
  blacklisted_from: z.string().nullable().default(null),
  blacklisted_at: z.string().nullable().default(null),
  supervisor_validated_at: z.string().nullable().default(null),
  supervisor_notes: z.string().nullable().default(null),
});

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
  is_blacklisted: z.boolean().optional().default(false),
  is_banned: z.boolean().optional().default(false),
  blacklist_tier: z.enum(['tier_1', 'tier_2']).nullable().optional().default(null),
  blacklist_info: candidateBlacklistInfoSchema.nullable().optional().default(null),
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
