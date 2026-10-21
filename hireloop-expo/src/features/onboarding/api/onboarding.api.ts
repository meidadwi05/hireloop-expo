import {httpClient} from '../../../core/api/http-client';
import type {OnboardingPayload} from '../onboarding.types';

export type CertificationUploadInput = {
  uri: string;
  name: string;
  mimeType: string;
  file?: Blob;
};

export type CertificationUploadResult = {
  path: string;
  originalName: string;
  mimeType: string;
  fileSize?: number;
};

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? value as Record<string, unknown> : {};
}

export const onboardingApi = {
  async getCurrent(): Promise<unknown> {
    const response = await httpClient.get('/onboarding/me');
    return response.data;
  },

  async submitStep(step: 1 | 2 | 3, payload: Record<string, unknown>): Promise<unknown> {
    const response = await httpClient.post(`/onboarding/step-${step}`, payload);
    return response.data;
  },

  async chooseCategory(payload: Record<string, unknown>): Promise<unknown> {
    const response = await httpClient.post('/onboarding/choose-category', payload);
    return response.data;
  },

  async submitProductionStep(step: 1 | 2 | 3 | 4, payload: Record<string, unknown>): Promise<unknown> {
    const response = await httpClient.post(`/prod-candidate/onboarding/step-${step}`, payload);
    return response.data;
  },

  async complete(payload: OnboardingPayload): Promise<unknown> {
    const response = await httpClient.post('/onboarding/step-3', payload);
    return response.data;
  },

  async uploadCertification(input: CertificationUploadInput): Promise<CertificationUploadResult> {
    const body = new FormData();
    if (input.file) {
      body.append('file', input.file, input.name);
    } else {
      body.append('file', {uri: input.uri, name: input.name, type: input.mimeType} as unknown as Blob);
    }
    const response = await httpClient.post('/prod-candidate/onboarding/certification-media', body, {
      headers: {'Content-Type': 'multipart/form-data'},
    });
    const root = record(response.data);
    const data = record(root.data ?? root);
    const path = String(data.path ?? data.file_path ?? data.url ?? '');
    if (!path) throw new Error('Server tidak mengembalikan lokasi file sertifikat.');
    return {
      path,
      originalName: String(data.original_name ?? data.name ?? input.name),
      mimeType: String(data.mime_type ?? input.mimeType),
      fileSize: Number(data.file_size ?? 0) || undefined,
    };
  },
};
