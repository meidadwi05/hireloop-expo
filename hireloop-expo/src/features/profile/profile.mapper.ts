import type {
  CandidateProfile,
  ProfileAddress,
  ProfileEducation,
  ProfileFileItem,
  UploadedProfileFile,
  WorkPeriodStatus,
  WorkSetting,
  WorkType,
} from './profile.types';

export function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? value as Record<string, unknown> : {};
}

function text(...values: unknown[]): string {
  const found = values.find(value => typeof value === 'string' && value.trim());
  return typeof found === 'string' ? found.trim() : '';
}

function number(value: unknown, fallback = 0): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function boolean(value: unknown): boolean {
  return value === true || value === 1 || value === '1';
}

function array(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function optionalDate(value: unknown): string | null {
  const result = text(value);
  return result || null;
}

function address(value: unknown): ProfileAddress | null {
  const raw = asRecord(value);
  const addressLine = text(raw.address_line);
  if (!addressLine && Object.keys(raw).length === 0) return null;
  return {
    addressLine,
    provinceCode: text(raw.province_code),
    provinceName: text(raw.province_name),
    regencyCode: text(raw.regency_code),
    regencyName: text(raw.regency_name, raw.regency),
    districtCode: text(raw.district_code),
    districtName: text(raw.district_name),
    villageCode: text(raw.village_code),
    villageName: text(raw.village_name),
    postalCode: text(raw.postal_code),
  };
}

function education(value: unknown): ProfileEducation {
  const raw = asRecord(value);
  const major = asRecord(raw.major);
  return {
    id: number(raw.id),
    educationLevel: text(raw.education_level),
    schoolName: text(raw.school_name),
    majorId: raw.major_id === null || raw.major_id === undefined ? null : number(raw.major_id),
    majorName: text(raw.major_name, major.name),
    startDate: optionalDate(raw.start_date),
    endDate: optionalDate(raw.end_date),
    additionalInfo: text(raw.additional_info),
  };
}

const workTypes: WorkType[] = ['full_time', 'paruh_waktu', 'kontrak', 'freelance', 'internship', 'outsourcing', 'kasual'];
const workSettings: WorkSetting[] = ['on_site', 'remote', 'hybrid'];
const workStatuses: WorkPeriodStatus[] = ['available', 'actively_looking', 'not_available', 'hired'];

function enumValue<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? value as T : fallback;
}

function stringArray(value: unknown): string[] {
  return array(value).map(item => text(item, asRecord(item).name)).filter(Boolean);
}

export function mapCandidateProfile(payload: unknown): CandidateProfile {
  const root = asRecord(payload);
  const data = asRecord(root.data ?? root);
  const user = asRecord(data.user);
  const seeker = asRecord(data.job_seeker ?? data);

  return {
    userId: number(user.id),
    jobSeekerId: number(seeker.id),
    email: text(seeker.email, user.email),
    fullName: text(seeker.full_name, user.full_name),
    nik: text(seeker.nik),
    gender: enumValue(seeker.gender, ['male', 'female'] as const, ''),
    birthPlace: text(seeker.birth_place),
    birthDate: optionalDate(seeker.birth_date),
    maritalStatus: enumValue(seeker.marital_status, ['single', 'married', 'other'] as const, ''),
    phone: text(seeker.phone),
    selfDescription: text(seeker.self_description),
    experienceYears: number(seeker.experience_years),
    avatarUrl: text(seeker.avatar_url) || null,
    workPeriodStatus: enumValue(seeker.work_period_status, workStatuses, 'available'),
    jobTypeExpected: enumValue(seeker.job_type_expected, workSettings, 'on_site'),
    workType: enumValue(seeker.work_type, workTypes, 'full_time'),
    expectedSalary: seeker.expected_salary === null || seeker.expected_salary === undefined
      ? null
      : number(seeker.expected_salary),
    preferredWorkTypes: array(seeker.preferred_work_types)
      .map(item => enumValue(item, workTypes, '' as WorkType))
      .filter(Boolean),
    preferredWorkSettings: array(seeker.preferred_work_settings)
      .map(item => enumValue(item, workSettings, '' as WorkSetting))
      .filter(Boolean),
    willingToWorkShifts: boolean(seeker.willing_to_work_shifts),
    willingToRelocate: boolean(seeker.willing_to_relocate),
    jobPreferences: array(seeker.job_preferences).map(item => {
      const role = asRecord(item);
      return {id: number(role.role_taxonomy_id ?? role.id), name: text(role.role_name, role.role, role.name)};
    }).filter(item => item.id > 0),
    expectedLocations: stringArray(seeker.expected_locations),
    ktpAddress: address(seeker.ktp_address_detail),
    domicileAddress: address(seeker.domicile_address_detail),
    sameAsKtp: boolean(seeker.same_as_ktp),
    educations: array(seeker.educations).map(education),
    skills: stringArray(seeker.skills),
    languages: stringArray(seeker.languages),
  };
}

function uploadedMedia(value: unknown): UploadedProfileFile | null {
  const raw = asRecord(value);
  const path = text(raw.path, raw.file_path);
  if (!path) return null;
  return {
    type: 'file',
    path,
    originalName: text(raw.original_name, raw.name) || 'Berkas',
    mimeType: text(raw.mime_type),
    size: number(raw.size, number(raw.file_size)),
  };
}

export function mapProfileFile(value: unknown): ProfileFileItem {
  const raw = asRecord(value);
  const type = raw.type === 'certification' ? 'certification' : 'document';
  const media = array(raw.media).map(uploadedMedia).filter((item): item is UploadedProfileFile => item !== null);
  const first = media[0];
  const id = number(raw.id);
  return {
    key: text(raw.key) || `${type}:${id}`,
    id,
    type,
    name: text(raw.name) || (type === 'document' ? 'Dokumen' : 'Sertifikat'),
    issuer: text(raw.issuer),
    issuedDate: optionalDate(raw.issued_date),
    expiredDate: optionalDate(raw.expired_date),
    credentialId: text(raw.credential_id),
    originalName: text(raw.original_name, first?.originalName),
    mimeType: text(raw.mime_type, first?.mimeType),
    size: number(raw.file_size, first?.size ?? 0),
    path: text(raw.file_path, first?.path),
    url: text(raw.url) || null,
    updatedAt: optionalDate(raw.updated_at),
    media,
  };
}

export function mapProfileFiles(payload: unknown): ProfileFileItem[] {
  const root = asRecord(payload);
  const values = Array.isArray(payload) ? payload : array(root.data);
  return values.map(mapProfileFile).filter(item => item.id > 0);
}

export function mapUploadedFile(payload: unknown): UploadedProfileFile {
  const root = asRecord(payload);
  const data = asRecord(root.data ?? root);
  const result = uploadedMedia(data);
  if (!result) throw new Error('Server tidak mengembalikan lokasi file yang valid.');
  return result;
}

export function formatAddress(value: ProfileAddress | null): string {
  if (!value) return 'Belum dilengkapi';
  return [
    value.addressLine,
    value.villageName,
    value.districtName,
    value.regencyName,
    value.provinceName,
    value.postalCode,
  ].filter(Boolean).join(', ');
}

export function calculateProfileCompletion(profile: CandidateProfile): number {
  const checks = [
    profile.fullName,
    profile.email,
    profile.phone,
    profile.birthDate,
    profile.gender,
    profile.ktpAddress,
    profile.selfDescription,
    profile.educations.length > 0,
    profile.skills.length > 0,
    profile.jobPreferences.length > 0,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}
