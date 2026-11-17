import {z} from 'zod';

const nullableText = z.string().nullable().optional();
const nullableNumber = z.coerce.number().nullable().optional();

export const performanceScoreSchema = z.looseObject({
  id: z.coerce.number().int().positive(),
  evaluation_date: nullableText,
  kualitas_kerja: nullableNumber,
  produktivitas: nullableNumber,
  kehadiran_ketepatan_waktu: nullableNumber,
  kedisiplinan_kepatuhan: nullableNumber,
  sikap_kerja_sama: nullableNumber,
  final_score: nullableNumber,
  score_grade: nullableText,
  kelebihan_karyawan: nullableText,
  hal_perlu_ditingkatkan: nullableText,
  catatan_penilai: nullableText,
  status: nullableText,
  evaluator: nullableText,
  created_at: nullableText,
  updated_at: nullableText,
});

export const performanceDecisionSchema = z.looseObject({
  id: z.coerce.number().int().positive(),
  tindak_lanjut_kontrak: nullableText,
  new_contract_start_date: nullableText,
  new_contract_end_date: nullableText,
  non_extension_effective_date: nullableText,
  non_extension_reason: nullableText,
  internal_note: nullableText,
  handover_plan: nullableText,
  notify_employee: z.boolean().optional(),
  decided_at: nullableText,
  decided_by: nullableText,
  status: nullableText,
});

export const performanceContractSchema = z.looseObject({
  contract_id: z.coerce.number().int().positive(),
  employee_id: z.coerce.number().int().positive(),
  employee_code: z.string().default('-'),
  employee_name: z.string().default('Karyawan'),
  project_name: nullableText,
  company_name: nullableText,
  position_name: z.string().default('-'),
  project_production_lowongan_id: nullableNumber,
  lowongan_name: nullableText,
  cycle_number: z.coerce.number().int().positive().default(1),
  contract_start_date: nullableText,
  contract_end_date: nullableText,
  days_remaining: nullableNumber,
  contract_status: z.string().default('active'),
  kpi_scores_count: z.coerce.number().int().min(0).default(0),
  kpi_status: z.string().default('Belum dinilai'),
  kpi_scores: z.array(performanceScoreSchema).default([]),
  contract_decision: performanceDecisionSchema.nullable().optional(),
  final_score: nullableNumber,
  score_grade: nullableText,
  evaluation_date: nullableText,
  evaluator_name: nullableText,
  updated_at: nullableText,
  tindak_lanjut_kontrak: z.string().default('belum_diputuskan'),
});

export const performanceResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(performanceContractSchema).default([]),
  metrics: z.object({
    total_pekerjaan: z.coerce.number().int().min(0).default(0),
    total_karyawan: z.coerce.number().int().min(0).default(0),
    sudah_dinilai: z.coerce.number().int().min(0).default(0),
    belum_dinilai: z.coerce.number().int().min(0).default(0),
    perlu_tindak_lanjut: z.coerce.number().int().min(0).default(0),
  }),
});

export type PerformanceResponse = z.infer<typeof performanceResponseSchema>;
export type PerformanceContract = z.infer<typeof performanceContractSchema>;
export type PerformanceScore = z.infer<typeof performanceScoreSchema>;

