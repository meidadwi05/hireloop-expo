export type ProfileAddress = {
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

export type ProfileEducation = {
  id: number;
  educationLevel: string;
  schoolName: string;
  majorId: number | null;
  majorName: string;
  startDate: string | null;
  endDate: string | null;
  additionalInfo: string;
};

export type ProfileRolePreference = {
  id: number;
  name: string;
};

export type CandidateProfile = {
  userId: number;
  jobSeekerId: number;
  email: string;
  fullName: string;
  nik: string;
  gender: 'male' | 'female' | '';
  birthPlace: string;
  birthDate: string | null;
  maritalStatus: 'single' | 'married' | 'other' | '';
  phone: string;
  selfDescription: string;
  experienceYears: number;
  avatarUrl: string | null;
  workPeriodStatus: WorkPeriodStatus;
  jobTypeExpected: WorkSetting;
  workType: WorkType;
  expectedSalary: number | null;
  preferredWorkTypes: WorkType[];
  preferredWorkSettings: WorkSetting[];
  willingToWorkShifts: boolean;
  willingToRelocate: boolean;
  jobPreferences: ProfileRolePreference[];
  expectedLocations: string[];
  ktpAddress: ProfileAddress | null;
  domicileAddress: ProfileAddress | null;
  sameAsKtp: boolean;
  educations: ProfileEducation[];
  skills: string[];
  languages: string[];
};

export type WorkType =
  | 'full_time'
  | 'paruh_waktu'
  | 'kontrak'
  | 'freelance'
  | 'internship'
  | 'outsourcing'
  | 'kasual';

export type WorkSetting = 'on_site' | 'remote' | 'hybrid';
export type WorkPeriodStatus = 'available' | 'actively_looking' | 'not_available' | 'hired';

export type WorkPreferenceInput = {
  job_type_expected: WorkSetting;
  work_type: WorkType;
  work_period_status: WorkPeriodStatus;
  expected_salary: number | null;
  preferred_work_types: WorkType[];
  preferred_work_settings: WorkSetting[];
  willing_to_work_shifts: boolean;
  willing_to_relocate: boolean;
  expected_locations: string[];
  job_preferences: {role_taxonomy_id: number}[];
};

export type UploadInput = {
  uri: string;
  name: string;
  mimeType: string;
  size?: number;
  file?: Blob;
};

export type UploadedProfileFile = {
  type: 'file';
  path: string;
  originalName: string;
  mimeType: string;
  size: number;
};

export type ProfileFileItem = {
  key: string;
  id: number;
  type: 'document' | 'certification';
  name: string;
  issuer: string;
  issuedDate: string | null;
  expiredDate: string | null;
  credentialId: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  url: string | null;
  updatedAt: string | null;
  media: UploadedProfileFile[];
};

export type DocumentInput = {
  name: string;
  file_path: string;
  original_name: string;
  mime_type: string;
  file_size: number;
  source: 'profile';
};

export type CertificationInput = {
  name: string;
  issuer: string;
  issued_date: string;
  expired_date: string | null;
  credential_id: string | null;
  media: {
    type: 'file';
    path: string;
    original_name: string;
  }[];
};

export type EducationInput = {
  education_level: string;
  school_name: string | null;
  major_id: number | null;
  start_date: string | null;
  end_date: string | null;
  additional_info: string | null;
};
