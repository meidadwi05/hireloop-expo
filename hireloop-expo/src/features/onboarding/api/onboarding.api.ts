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

export type ImageUploadInput = {uri: string; name: string; mimeType: string; file?: Blob};
export type KtpExtractedData = {
  nik?: string | null;
  full_name?: string | null;
  birth_place?: string | null;
  birth_date?: string | null;
  gender?: 'male' | 'female' | null;
  marital_status?: 'single' | 'married' | 'other' | null;
  full_address?: string | null;
  address?: string | null;
  rt_rw?: string | null;
  provinsi?: string | null;
  kota_kab?: string | null;
  kecamatan?: string | null;
  kel_desa?: string | null;
};
export type KtpUploadResult = {path: string; url: string; extracted: KtpExtractedData};
export type AvatarUploadResult = {path: string; url: string};
export type NikAvailabilityResult = {
  available: boolean;
  status?: 'active_user' | 'reused_deleted' | 'fresh' | null;
  hasBlacklist?: boolean;
  isBanned?: boolean;
  message: string;
};

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? value as Record<string, unknown> : {};
}

function appendUpload(body: FormData, field: string, input: ImageUploadInput) {
  if (input.file) body.append(field, input.file, input.name);
  else body.append(field, {uri: input.uri, name: input.name, type: input.mimeType} as unknown as Blob);
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

  async uploadKtp(input: ImageUploadInput, previousPath?: string): Promise<KtpUploadResult> {
    const body = new FormData();
    appendUpload(body, 'image', input);
    if (previousPath) body.append('previous_ktp_path', previousPath);
    const response = await httpClient.post('/ocr/ktp', body, {headers: {'Content-Type': 'multipart/form-data'}});
    const root = record(response.data);
    const data = record(root.data ?? root);
    return {path: String(data.ktp_path ?? ''), url: String(data.ktp_url ?? ''), extracted: record(data.extracted) as KtpExtractedData};
  },

  async uploadAvatar(input: ImageUploadInput): Promise<AvatarUploadResult> {
    const body = new FormData();
    appendUpload(body, 'avatar', input);
    const response = await httpClient.post('/job-seeker/avatar', body, {headers: {'Content-Type': 'multipart/form-data'}});
    const root = record(response.data);
    const data = record(root.data ?? root);
    return {path: String(data.avatar_path ?? ''), url: String(data.avatar_url ?? '')};
  },

  async checkNik(nik: string): Promise<NikAvailabilityResult> {
    const response = await httpClient.get('/prod-candidate/onboarding/check-nik', {params: {nik}});
    const root = record(response.data);
    const data = record(root.data ?? root);
    return {
      available: Boolean(data.available),
      status: ['active_user', 'reused_deleted', 'fresh'].includes(String(data.status))
        ? String(data.status) as NikAvailabilityResult['status']
        : null,
      hasBlacklist: Boolean(data.has_blacklist),
      isBanned: Boolean(data.is_banned),
      message: String(data.message ?? (data.available ? 'NIK tersedia.' : 'NIK tidak dapat digunakan.')),
    };
  },
};
