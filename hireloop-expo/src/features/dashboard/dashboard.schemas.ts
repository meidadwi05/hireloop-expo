import {z} from 'zod';

const interviewSchema = z.object({
  id: z.union([z.number(), z.string()]),
  session_id: z.union([z.number(), z.string()]).nullable().optional(),
  applicant_data_id: z.union([z.number(), z.string()]).nullable().optional(),
  job_reference_type: z.enum(['job-posting', 'project-lowongan']).nullable().optional(),
  job_reference_id: z.union([z.number(), z.string()]).nullable().optional(),
  project_production_lowongan_id: z.union([z.number(), z.string()]).nullable().optional(),
  date: z.string(),
  agenda: z.string().default('Interview'),
  time: z.string().nullable().default(null),
  start_time: z.string().nullable().optional(),
  end_time: z.string().nullable().optional(),
  mode: z.enum(['online', 'offline']).catch('offline'),
  method: z.string().nullable().optional(),
  location: z.string().nullable().default(null),
  location_platform: z.string().nullable().optional(),
  meeting_link: z.string().nullable().default(null),
  address_link: z.string().nullable().optional(),
  address_maps_url: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
  role_taxonomy_name: z.string().default('Posisi Pekerjaan'),
  candidate_name: z.string().default('Kandidat'),
  company_name: z.string().nullable().optional(),
  lowongan_name: z.string().nullable().optional(),
  project_name: z.string().nullable().optional(),
  stage_name: z.string().nullable().optional(),
  interview_type: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  schedule_status: z.string().nullable().optional(),
  pic_name: z.string().nullable().optional(),
});

export const dashboardResponseSchema = z.object({
  success: z.boolean().optional(),
  data: z.object({
    interviews: z.array(interviewSchema).default([]),
  }),
});
