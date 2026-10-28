import {z} from 'zod';

const nullableText = z.string().nullable().optional();
const nullableNumber = z.coerce.number().nullable().optional();

export const rawApplicationSchema = z.looseObject({
  id: z.coerce.number().int().positive(),
  job_reference_type: z.enum(['job-posting', 'project-lowongan']).optional(),
  job_reference_id: nullableNumber,
  job_posting_id: nullableNumber,
  job_title: nullableText,
  company_name: nullableText,
  location: nullableText,
  application_status: nullableText,
  status: nullableText,
  status_key: nullableText,
  status_label: nullableText,
  stage_status: nullableText,
  current_stage_index: nullableNumber,
  current_stage_value: nullableText,
  current_stage_name: nullableText,
  current_stage_label: nullableText,
  application_stage_order: nullableNumber,
  application_stage_snapshot: z.unknown().optional(),
  stage_snapshot: z.unknown().optional(),
  submitted_at: nullableText,
  created_at: nullableText,
  updated_at: nullableText,
  canceled_at: nullableText,
  cancelled_at: nullableText,
  deleted_at: nullableText,
  is_temporary: z.union([z.boolean(), z.coerce.number()]).optional(),
  transfer_type: nullableText,
  transferred_from_applicant_id: nullableNumber,
  transfer_note: nullableText,
});

export const applicationsMeResponseSchema = z.object({
  success: z.boolean().optional(),
  data: z.object({
    job_applications: z.array(rawApplicationSchema).default([]),
  }),
});

const recruitmentStageSchema = z.looseObject({
  index: z.coerce.number().int().min(0),
  value: z.string().default('stage'),
  label: z.string().default('Tahap Seleksi'),
  type: z.string().nullable().optional(),
  status: z.string().default('Pending'),
  is_current: z.boolean().default(false),
  is_completed: z.boolean().default(false),
  started_at: nullableText,
  completed_at: nullableText,
  note: nullableText,
});

export const recruitmentProcessResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    application_id: z.coerce.number().int().positive(),
    current_stage: z.object({
      index: z.coerce.number().int().min(0),
      value: z.string(),
      label: z.string(),
      status: z.string(),
    }),
    final_decision: z.object({
      value: z.enum(['hired', 'rejected']),
      label: z.string(),
      status: z.string(),
      note: nullableText,
      decided_at: nullableText,
    }).nullable().optional(),
    stages: z.array(recruitmentStageSchema).default([]),
  }),
});

export type RawApplication = z.infer<typeof rawApplicationSchema>;
export type RawRecruitmentProcess = z.infer<typeof recruitmentProcessResponseSchema>['data'];
