import {z} from 'zod';

const interviewSchema = z.object({
  id: z.union([z.number(), z.string()]),
  date: z.string(),
  agenda: z.string().default('Interview'),
  time: z.string().nullable().default(null),
  mode: z.enum(['online', 'offline']).catch('offline'),
  location: z.string().nullable().default(null),
  meeting_link: z.string().nullable().default(null),
  role_taxonomy_name: z.string().default('Posisi Pekerjaan'),
  candidate_name: z.string().default('Kandidat'),
});

export const dashboardResponseSchema = z.object({
  success: z.boolean().optional(),
  data: z.object({
    interviews: z.array(interviewSchema).default([]),
  }),
});
