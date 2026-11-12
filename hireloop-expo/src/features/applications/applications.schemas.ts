import {z} from 'zod';

const nullableText = z.string().nullable().optional();
const nullableNumber = z.coerce.number().nullable().optional();

const recruitmentStageReferenceSchema = z.object({
  index: nullableNumber,
  value: nullableText,
  label: nullableText,
  status: nullableText,
});

const recruitmentHistorySchema = z.looseObject({
  id: z.coerce.number().int().positive(),
  action_type: z.string().default('STAGE_UPDATED'),
  from_stage: recruitmentStageReferenceSchema,
  to_stage: recruitmentStageReferenceSchema,
  note: nullableText,
  metadata: z.unknown().optional(),
  occurred_at: nullableText,
});

const recruitmentResultSchema = z.looseObject({
  id: z.coerce.number().int().positive(),
  stage_index: nullableNumber,
  stage_value: nullableText,
  stage_label: nullableText,
  type: nullableText,
  execution_status: nullableText,
  status: nullableText,
  score: nullableNumber,
  scorecard: z.unknown().optional(),
  note: nullableText,
  attachment_path: nullableText,
  created_at: nullableText,
  updated_at: nullableText,
});

const recruitmentScheduleSchema = z.looseObject({
  id: z.coerce.number().int().positive(),
  stage_index: nullableNumber,
  stage_value: nullableText,
  stage_label: nullableText,
  type: nullableText,
  agenda: nullableText,
  date: nullableText,
  start_time: nullableText,
  end_time: nullableText,
  method: nullableText,
  location_platform: nullableText,
  address_link: nullableText,
  address_maps_url: nullableText,
  session_id: nullableNumber,
  note: nullableText,
  status: nullableText,
  reschedule_count: z.coerce.number().int().min(0).default(0),
  medical_result: nullableText,
  cancellation_reason: nullableText,
  cancellation_after_action: nullableText,
  cancellation_note: nullableText,
  created_at: nullableText,
  updated_at: nullableText,
});

const recruitmentOfferingSchema = z.looseObject({
  id: z.coerce.number().int().positive(),
  status: nullableText,
  effective_date: nullableText,
  note: nullableText,
  confirmation_source: nullableText,
  created_at: nullableText,
  updated_at: nullableText,
});

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
  icon: nullableText,
  color: nullableText,
  status: z.string().default('Pending'),
  is_current: z.boolean().default(false),
  is_completed: z.boolean().default(false),
  started_at: nullableText,
  completed_at: nullableText,
  note: nullableText,
  histories: z.array(recruitmentHistorySchema).default([]),
  results: z.array(recruitmentResultSchema).default([]),
  schedules: z.array(recruitmentScheduleSchema).default([]),
  offerings: z.array(recruitmentOfferingSchema).default([]),
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
