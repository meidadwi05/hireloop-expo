import type {
  AddressDetail,
  AvailabilityStatus,
  OnboardingDraft,
  OnboardingPayload,
  SkillOption,
} from './onboarding.types';
import {createEmptyOnboardingDraft, emptyAddress} from './onboarding.types';

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? value as Record<string, unknown> : {};
}

function asText(...values: unknown[]): string {
  const value = values.find(item => typeof item === 'string' || typeof item === 'number');
  return value == null ? '' : String(value);
}

function asBoolean(value: unknown): boolean {
  return value === true || value === 1 || value === '1';
}

function mapAddress(value: unknown, fallback = ''): AddressDetail {
  const address = asRecord(value);
  return {
    ...emptyAddress(),
    addressLine: asText(address.address_line, fallback),
    provinceCode: asText(address.province_code),
    provinceName: asText(address.province_name),
    regencyCode: asText(address.regency_code),
    regencyName: asText(address.regency_name),
    districtCode: asText(address.district_code),
    districtName: asText(address.district_name),
    villageCode: asText(address.village_code),
    villageName: asText(address.village_name),
    postalCode: asText(address.postal_code),
  };
}

function addressPayload(address: AddressDetail): Record<string, string> {
  return {
    address_line: address.addressLine.trim(),
    province_code: address.provinceCode,
    province_name: address.provinceName,
    regency_code: address.regencyCode,
    regency_name: address.regencyName,
    district_code: address.districtCode,
    district_name: address.districtName,
    village_code: address.villageCode,
    village_name: address.villageName,
    postal_code: address.postalCode,
  };
}

function availabilityToWorkPeriod(value: AvailabilityStatus): string {
  if (value === 'actively_looking') return 'actively_looking';
  if (value === 'not_available') return 'not_available';
  return 'available';
}

export function normalizeSkillOptions(input: unknown): SkillOption[] {
  const source = Array.isArray(input) ? input : Array.isArray(asRecord(input).data) ? asRecord(input).data as unknown[] : [];
  return source.map(item => {
    const record = asRecord(item);
    return {id: Number(record.id), name: asText(record.name, record.label), type: asText(record.type) || null};
  }).filter(item => Number.isFinite(item.id) && item.name);
}

export function mapCurrentOnboarding(input: unknown, fallbackName = ''): OnboardingDraft {
  const root = asRecord(input);
  const data = asRecord(root.data ?? root);
  const user = asRecord(data.user);
  const seeker = asRecord(data.job_seeker);
  const draft = createEmptyOnboardingDraft(asText(user.full_name, fallbackName));
  const educations = Array.isArray(seeker.educations) ? seeker.educations : [];
  const experiences = Array.isArray(seeker.pengalaman_kerja)
    ? seeker.pengalaman_kerja
    : Array.isArray(seeker.work_experiences) ? seeker.work_experiences : [];

  return {
    ...draft,
    fullName: asText(user.full_name, seeker.full_name, fallbackName),
    gender: ['male', 'female'].includes(asText(seeker.gender)) ? asText(seeker.gender) as OnboardingDraft['gender'] : '',
    birthPlace: asText(seeker.birth_place),
    birthDate: asText(seeker.birth_date).split('T')[0],
    maritalStatus: ['single', 'married', 'other'].includes(asText(seeker.marital_status))
      ? asText(seeker.marital_status) as OnboardingDraft['maritalStatus'] : '',
    phone: asText(seeker.phone),
    identityAddress: mapAddress(seeker.ktp_address_detail, asText(seeker.ktp_address)),
    domicileAddress: mapAddress(seeker.domicile_address_detail, asText(seeker.address)),
    domicileSameAsIdentity: asBoolean(seeker.same_as_ktp),
    educations: educations.map((item, index) => {
      const record = asRecord(item);
      const major = asRecord(record.major);
      return {
        id: asText(record.id, `education-${index}`),
        educationLevel: asText(record.education_level),
        schoolName: asText(record.school_name),
        majorId: Number.isFinite(Number(record.major_id ?? major.id)) ? Number(record.major_id ?? major.id) : null,
        majorName: asText(major.name, record.major_name, record.major),
        startDate: asText(record.start_date).split('T')[0],
        endDate: asText(record.end_date).split('T')[0],
        ongoing: asBoolean(record.ongoing) || Boolean(record.start_date && !record.end_date),
      };
    }),
    experiences: experiences.map((item, index) => {
      const record = asRecord(item);
      return {
        id: asText(record.id, `experience-${index}`),
        experienceListId: Number.isFinite(Number(record.experience_list_id)) ? Number(record.experience_list_id) : null,
        position: asText(record.posisi, record.position),
        companyName: asText(record.nama_perusahaan, record.company_name),
        startDate: asText(record.tanggal_mulai, record.start_date).split('T')[0],
        endDate: asText(record.tanggal_berakhir, record.end_date).split('T')[0],
        current: asBoolean(record.masih_bekerja ?? record.current),
        workSystem: asText(record.sistem_kerja, record.work_system),
        employmentStatus: asText(record.status_pekerjaan, record.employment_status),
        location: asText(record.location, record.lokasi),
        description: asText(record.deskripsi, record.description),
      };
    }),
    hasNoExperience: asBoolean(seeker.no_pengalaman_kerja),
    tools: asText(seeker.pengalaman_mesin),
    availability: ['available', 'actively_looking', 'not_available'].includes(asText(seeker.availability))
      ? asText(seeker.availability) as AvailabilityStatus : '',
  };
}

export function toOnboardingPayload(draft: OnboardingDraft): OnboardingPayload {
  const domicile = draft.domicileSameAsIdentity ? draft.identityAddress : draft.domicileAddress;
  const profileFiles = draft.certifications.filter(item => item.remotePath).map(item => ({
    type: 'certification',
    name: item.name,
    issuer: item.issuer,
    issued_date: item.issuedDate,
    expired_date: item.noExpiry ? null : item.expiredDate || null,
    no_expiry: item.noExpiry,
    credential_id: item.credentialId || null,
    path: item.remotePath,
    original_name: item.originalName ?? item.name,
    mime_type: item.mimeType,
    file_size: item.fileSize,
  }));

  return {
    full_name: draft.fullName.trim(),
    gender: draft.gender as Exclude<typeof draft.gender, ''>,
    birth_place: draft.birthPlace.trim(),
    birth_date: draft.birthDate,
    marital_status: draft.maritalStatus as Exclude<typeof draft.maritalStatus, ''>,
    phone: draft.phone.replace(/\D/g, ''),
    same_as_ktp: draft.domicileSameAsIdentity,
    ktp_address: draft.identityAddress.addressLine.trim(),
    address: domicile.addressLine.trim(),
    ktp_address_detail: addressPayload(draft.identityAddress),
    domicile_address_detail: draft.domicileSameAsIdentity ? null : addressPayload(draft.domicileAddress),
    work_period_status: availabilityToWorkPeriod(draft.availability),
    availability: draft.availability as Exclude<typeof draft.availability, ''>,
    educations: draft.educations.map(item => ({
      education_level: item.educationLevel,
      school_name: item.schoolName.trim(),
      major_id: item.majorId,
      major_name: item.majorName.trim(),
      start_date: item.startDate,
      end_date: item.ongoing ? null : item.endDate,
      ongoing: item.ongoing,
    })),
    skills: draft.skills.map(item => ({skill_id: item.skillId, custom_name: item.customName, name: item.name})),
    pengalaman_kerja: draft.experiences.map(item => ({
      experience_list_id: item.experienceListId,
      posisi: item.position.trim(),
      nama_perusahaan: item.companyName.trim(),
      tanggal_mulai: item.startDate,
      tanggal_berakhir: item.current ? null : item.endDate,
      masih_bekerja: item.current,
      sistem_kerja: item.workSystem,
      status_pekerjaan: item.employmentStatus,
      lokasi: item.location.trim(),
      deskripsi: item.description.trim(),
    })),
    no_pengalaman_kerja: draft.hasNoExperience,
    pengalaman_mesin: draft.tools.trim(),
    sertifikasi: [],
    profile_files: profileFiles,
    persetujuan: true,
    bersedia_posisi_sesuai: true,
  };
}
