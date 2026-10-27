export type Gender = '' | 'male' | 'female';
export type MaritalStatus = '' | 'single' | 'married' | 'other';
export type AvailabilityStatus = '' | 'available' | 'actively_looking' | 'not_available';

export type AddressDetail = {
  addressLine: string;
  provinceCode: string;
  provinceName: string;
  regencyCode: string;
  regencyName: string;
  districtCode: string;
  districtName: string;
  villageCode: string;
  villageName: string;
  postalCode: string;
};

export type EducationDraft = {
  id: string;
  educationLevel: string;
  schoolName: string;
  majorId: number | null;
  majorName: string;
  startDate: string;
  endDate: string;
  ongoing: boolean;
};

export type ExperienceDraft = {
  id: string;
  experienceListId: number | null;
  position: string;
  companyName: string;
  startDate: string;
  endDate: string;
  current: boolean;
  workSystem: string;
  employmentStatus: string;
  location: string;
  description: string;
};

export type CertificationDraft = {
  id: string;
  name: string;
  issuer: string;
  issuedDate: string;
  expiredDate: string;
  noExpiry: boolean;
  credentialId: string;
  remotePath?: string;
  originalName?: string;
  mimeType?: string;
  fileSize?: number;
};

export type SkillOption = {
  id: number;
  name: string;
  type?: string | null;
};

export type SelectedSkill = {
  skillId: number | null;
  customName: string | null;
  name: string;
};

export type MasterOption = {
  value: string;
  label: string;
};

export type OnboardingDraft = {
  fullName: string;
  gender: Gender;
  birthPlace: string;
  birthDate: string;
  maritalStatus: MaritalStatus;
  phone: string;
  identityAddress: AddressDetail;
  domicileAddress: AddressDetail;
  domicileSameAsIdentity: boolean;
  educations: EducationDraft[];
  experiences: ExperienceDraft[];
  hasNoExperience: boolean;
  skills: SelectedSkill[];
  tools: string;
  certifications: CertificationDraft[];
  availability: AvailabilityStatus;
  acceptedTerms: boolean;
  acceptedMatching: boolean;
};

export type OnboardingActionFeedback = {
  loadingMessage: string;
  successTitle: string;
  successMessage: string;
  errorTitle?: string;
  minimumDuration?: number;
};

export type RunOnboardingAction = (
  feedback: OnboardingActionFeedback,
  operation: () => Promise<void> | void,
) => void;

export type OnboardingState = {
  step: 1 | 2;
  draft: OnboardingDraft;
  submitting: boolean;
};

export type OnboardingAction =
  | {type: 'hydrate'; draft: OnboardingDraft}
  | {type: 'set-step'; step: 1 | 2}
  | {type: 'set-field'; field: keyof OnboardingDraft; value: OnboardingDraft[keyof OnboardingDraft]}
  | {type: 'set-address'; target: 'identityAddress' | 'domicileAddress'; address: AddressDetail}
  | {type: 'set-education'; education: EducationDraft}
  | {type: 'remove-education'; id: string}
  | {type: 'set-experience'; experience: ExperienceDraft}
  | {type: 'remove-experience'; id: string}
  | {type: 'set-certification'; certification: CertificationDraft}
  | {type: 'remove-certification'; id: string}
  | {type: 'toggle-skill'; skill: SkillOption}
  | {type: 'submitting'; value: boolean};

export type OnboardingPayload = {
  full_name: string;
  gender: Exclude<Gender, ''>;
  birth_place: string;
  birth_date: string;
  marital_status: Exclude<MaritalStatus, ''>;
  phone: string;
  same_as_ktp: boolean;
  ktp_address: string;
  address: string;
  ktp_address_detail: Record<string, string>;
  domicile_address_detail: Record<string, string> | null;
  work_period_status: string;
  availability: Exclude<AvailabilityStatus, ''>;
  educations: Record<string, unknown>[];
  skills: Record<string, unknown>[];
  pengalaman_kerja: Record<string, unknown>[];
  no_pengalaman_kerja: boolean;
  pengalaman_mesin: string;
  sertifikasi: Record<string, unknown>[];
  profile_files: Record<string, unknown>[];
  persetujuan: true;
  bersedia_posisi_sesuai: true;
};

export function emptyAddress(): AddressDetail {
  return {
    addressLine: '',
    provinceCode: '',
    provinceName: '',
    regencyCode: '',
    regencyName: '',
    districtCode: '',
    districtName: '',
    villageCode: '',
    villageName: '',
    postalCode: '',
  };
}

export function createEmptyOnboardingDraft(fullName = ''): OnboardingDraft {
  return {
    fullName,
    gender: '',
    birthPlace: '',
    birthDate: '',
    maritalStatus: '',
    phone: '',
    identityAddress: emptyAddress(),
    domicileAddress: emptyAddress(),
    domicileSameAsIdentity: false,
    educations: [],
    experiences: [],
    hasNoExperience: false,
    skills: [],
    tools: '',
    certifications: [],
    availability: '',
    acceptedTerms: false,
    acceptedMatching: false,
  };
}
