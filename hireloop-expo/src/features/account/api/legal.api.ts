import {z} from 'zod';

import {httpClient} from '../../../core/api/http-client';

const legalDocumentEntrySchema = z.looseObject({
  id: z.coerce.number().int().positive(),
  title: z.string().default(''),
  desc: z.string().nullable().default(null),
  content: z.array(z.string()).nullable().default(null),
  structure: z.string().nullable().default(null),
  updated_at: z.string().nullable().optional(),
});

const legalDocumentResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(legalDocumentEntrySchema).default([]),
});

export type LegalDocumentKind = 'privacy' | 'terms';
export type LegalDocumentEntry = {
  id: number;
  title: string;
  description: string;
  content: string[];
  structure: string;
  updatedAt: string | null;
};

export function mapLegalDocumentResponse(value: unknown): LegalDocumentEntry[] {
  const response = legalDocumentResponseSchema.parse(value);
  return response.data.map(entry => ({
    id: entry.id,
    title: entry.title.trim(),
    description: entry.desc?.trim() ?? '',
    content: entry.content ?? [],
    structure: entry.structure?.trim() ?? '',
    updatedAt: entry.updated_at ?? null,
  }));
}

export const legalApi = {
  async getDocument(kind: LegalDocumentKind): Promise<LegalDocumentEntry[]> {
    const response = await httpClient.get(kind === 'privacy' ? '/terms' : '/rules');
    return mapLegalDocumentResponse(response.data);
  },
};
