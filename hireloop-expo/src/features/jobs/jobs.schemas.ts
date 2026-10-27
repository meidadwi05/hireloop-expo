import {z} from 'zod';

export const candidateJobSourceSchema = z.enum(['job-posting', 'project-lowongan']);

export const candidateJobEntrySchema = z.object({
  source: candidateJobSourceSchema,
  job: z.looseObject({
    id: z.union([z.number(), z.string()]),
  }),
});

export const candidateJobsResponseSchema = z.object({
  data: z.array(candidateJobEntrySchema).default([]),
  current_page: z.coerce.number().int().min(1).default(1),
  last_page: z.coerce.number().int().min(1).default(1),
  per_page: z.coerce.number().int().min(1).default(12),
  total: z.coerce.number().int().min(0).default(0),
  from: z.coerce.number().int().min(1).nullable().optional().default(null),
  to: z.coerce.number().int().min(1).nullable().optional().default(null),
});
