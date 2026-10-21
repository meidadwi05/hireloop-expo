import {z} from 'zod';

import type {OnboardingDraft} from './onboarding.types';

const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

export function isValidIsoDate(value: string): boolean {
  if (!isoDatePattern.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export function calculateAge(birthDate: string, today = new Date()): number | null {
  if (!isValidIsoDate(birthDate)) return null;
  const [year, month, day] = birthDate.split('-').map(Number);
  let age = today.getFullYear() - year;
  const monthDifference = today.getMonth() + 1 - month;
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < day)) age -= 1;
  return age >= 0 ? age : null;
}

const addressSchema = z.object({
  addressLine: z.string().trim().min(1, 'Detail alamat wajib diisi'),
  provinceCode: z.string().min(1, 'Provinsi wajib dipilih'),
  provinceName: z.string().min(1),
  regencyCode: z.string().min(1, 'Kota/kabupaten wajib dipilih'),
  regencyName: z.string().min(1),
  districtCode: z.string().min(1, 'Kecamatan wajib dipilih'),
  districtName: z.string().min(1),
  villageCode: z.string().min(1, 'Kelurahan/desa wajib dipilih'),
  villageName: z.string().min(1),
  postalCode: z.string(),
});

export const educationSchema = z.object({
  id: z.string(),
  educationLevel: z.string().trim().min(1, 'Tingkat pendidikan wajib dipilih'),
  schoolName: z.string().trim().min(1, 'Nama institusi wajib diisi'),
  majorName: z.string().trim().min(1, 'Jurusan wajib diisi'),
  startDate: z.string().refine(isValidIsoDate, 'Tanggal mulai tidak valid'),
  endDate: z.string(),
  ongoing: z.boolean(),
}).superRefine((education, context) => {
  if (!education.ongoing && !isValidIsoDate(education.endDate)) {
    context.addIssue({code: 'custom', path: ['endDate'], message: 'Tanggal selesai wajib diisi'});
  }
  if (!education.ongoing && education.endDate < education.startDate) {
    context.addIssue({code: 'custom', path: ['endDate'], message: 'Tanggal selesai harus setelah tanggal mulai'});
  }
});

export const experienceSchema = z.object({
  id: z.string(),
  experienceListId: z.number().nullable(),
  position: z.string().trim().min(1, 'Posisi wajib diisi'),
  companyName: z.string().trim().min(1, 'Nama perusahaan wajib diisi'),
  startDate: z.string().refine(isValidIsoDate, 'Tanggal mulai tidak valid'),
  endDate: z.string(),
  current: z.boolean(),
  workSystem: z.string().trim().min(1, 'Sistem kerja wajib dipilih'),
  employmentStatus: z.string().trim().min(1, 'Status pekerjaan wajib dipilih'),
  location: z.string(),
  description: z.string(),
}).superRefine((experience, context) => {
  if (!experience.current && !isValidIsoDate(experience.endDate)) {
    context.addIssue({code: 'custom', path: ['endDate'], message: 'Tanggal selesai wajib diisi'});
  }
  if (!experience.current && experience.endDate < experience.startDate) {
    context.addIssue({code: 'custom', path: ['endDate'], message: 'Tanggal selesai harus setelah tanggal mulai'});
  }
});

export const personalStepSchema = z.object({
  fullName: z.string().trim().min(2, 'Nama lengkap wajib diisi'),
  gender: z.enum(['male', 'female'], {message: 'Jenis kelamin wajib dipilih'}),
  birthPlace: z.string().trim().min(1, 'Tempat lahir wajib diisi'),
  birthDate: z.string().refine(isValidIsoDate, 'Tanggal lahir tidak valid').refine(value => {
    const age = calculateAge(value);
    return age !== null && age >= 15 && age <= 100;
  }, 'Usia harus antara 15 sampai 100 tahun'),
  maritalStatus: z.enum(['single', 'married', 'other'], {message: 'Status pernikahan wajib dipilih'}),
  phone: z.string().refine(value => {
    const digits = value.replace(/\D/g, '');
    return digits.length >= 8 && digits.length <= 15;
  }, 'Nomor handphone harus terdiri dari 8 sampai 15 digit'),
  identityAddress: addressSchema,
  domicileAddress: addressSchema,
  domicileSameAsIdentity: z.boolean(),
  educations: z.array(educationSchema).min(1, 'Tambahkan minimal satu pendidikan'),
});

export const workStepSchema = z.object({
  experiences: z.array(experienceSchema),
  hasNoExperience: z.boolean(),
  skills: z.array(z.object({
    skillId: z.number().nullable(),
    customName: z.string().nullable(),
    name: z.string().min(1),
  })).min(1, 'Pilih minimal satu keahlian'),
  tools: z.string().trim().min(1, 'Pengalaman mesin atau tools wajib diisi'),
  certifications: z.array(z.object({
    id: z.string(),
    name: z.string().trim().min(1),
    issuer: z.string().trim().min(1),
    issuedDate: z.string().refine(isValidIsoDate),
    expiredDate: z.string(),
    noExpiry: z.boolean(),
    credentialId: z.string(),
    remotePath: z.string().min(1),
    originalName: z.string().optional(),
    mimeType: z.string().optional(),
    fileSize: z.number().optional(),
  })).min(1, 'Tambahkan minimal satu sertifikasi'),
  availability: z.enum(['available', 'actively_looking', 'not_available'], {message: 'Status ketersediaan wajib dipilih'}),
  acceptedTerms: z.literal(true, {message: 'Persetujuan wajib dicentang'}),
  acceptedMatching: z.literal(true, {message: 'Persetujuan wajib dicentang'}),
}).superRefine((data, context) => {
  if (!data.hasNoExperience && data.experiences.length === 0) {
    context.addIssue({code: 'custom', path: ['experiences'], message: 'Tambahkan pengalaman atau pilih belum memiliki pengalaman'});
  }
});

export function validatePersonalStep(draft: OnboardingDraft) {
  return personalStepSchema.safeParse(draft);
}

export function validateWorkStep(draft: OnboardingDraft) {
  return workStepSchema.safeParse(draft);
}

export function firstValidationMessage(error: z.ZodError): string {
  return error.issues[0]?.message ?? 'Periksa kembali data yang diisi.';
}
