import {mapCurrentOnboarding, toOnboardingPayload} from '../onboarding.mapper';
import {onboardingReducer} from '../onboarding.reducer';
import {calculateAge, validatePersonalStep, validateWorkStep} from '../onboarding.schemas';
import {createEmptyOnboardingDraft, emptyAddress, type OnboardingDraft, type OnboardingState} from '../onboarding.types';

function completeDraft(): OnboardingDraft {
  const address = {
    ...emptyAddress(),
    addressLine: 'Jl. Contoh No. 1',
    provinceCode: '31',
    provinceName: 'DKI Jakarta',
    regencyCode: '3171',
    regencyName: 'Jakarta Selatan',
    districtCode: '3171010',
    districtName: 'Tebet',
    villageCode: '3171010001',
    villageName: 'Tebet Barat',
    postalCode: '12810',
  };
  return {
    ...createEmptyOnboardingDraft('Azka Pratama'),
    gender: 'male',
    birthPlace: 'Jakarta',
    birthDate: '1993-05-10',
    maritalStatus: 'single',
    phone: '+62 812-3456-7890',
    identityAddress: address,
    domicileAddress: address,
    domicileSameAsIdentity: true,
    educations: [{id: 'education-1', educationLevel: 'S1', schoolName: 'Universitas Indonesia', majorId: 17, majorName: 'Manajemen', startDate: '2012-08-01', endDate: '2016-07-01', ongoing: false}],
    hasNoExperience: true,
    skills: [{skillId: 12, customName: null, name: 'Kanban'}],
    tools: 'Mesin CNC',
    certifications: [{id: 'certification-1', name: 'Data Analytics', issuer: 'Google', issuedDate: '2025-01-01', expiredDate: '', noExpiry: true, credentialId: 'CERT-1', remotePath: '/uploads/cert-1.pdf'}],
    availability: 'available',
    acceptedTerms: true,
    acceptedMatching: true,
  };
}

describe('onboarding domain', () => {
  test('menghitung usia sebelum dan sesudah ulang tahun', () => {
    expect(calculateAge('2000-10-22', new Date(2026, 9, 21))).toBe(25);
    expect(calculateAge('2000-10-20', new Date(2026, 9, 21))).toBe(26);
  });

  test('memvalidasi langkah personal dan pekerjaan yang lengkap', () => {
    const draft = completeDraft();
    expect(validatePersonalStep(draft).success).toBe(true);
    expect(validateWorkStep(draft).success).toBe(true);
  });

  test('menolak langkah kerja tanpa pengalaman maupun pilihan belum berpengalaman', () => {
    const draft = {...completeDraft(), hasNoExperience: false, experiences: []};
    expect(validateWorkStep(draft).success).toBe(false);
  });

  test('menerima tools dan sertifikasi kosong sesuai kontrak web/backend', () => {
    const draft = {...completeDraft(), tools: '', certifications: []};
    expect(validateWorkStep(draft).success).toBe(true);
  });

  test('menerima detail pendidikan opsional selama tingkat pendidikan tersedia', () => {
    const draft = {
      ...completeDraft(),
      educations: [{id: 'education-optional', educationLevel: 'SMA/SMK', schoolName: '', majorId: null, majorName: '', startDate: '', endDate: '', ongoing: false}],
    };
    expect(validatePersonalStep(draft).success).toBe(true);
  });

  test('menolak nama kurang dari tiga karakter dan telepon lebih dari dua puluh digit', () => {
    expect(validatePersonalStep({...completeDraft(), fullName: 'AB'}).success).toBe(false);
    expect(validatePersonalStep({...completeDraft(), phone: '1'.repeat(21)}).success).toBe(false);
  });

  test('reducer menyinkronkan domisili dan melakukan upsert pendidikan', () => {
    const draft = completeDraft();
    let state: OnboardingState = {step: 1, draft: {...draft, domicileSameAsIdentity: true}, submitting: false};
    const nextAddress = {...draft.identityAddress, addressLine: 'Alamat baru'};
    state = onboardingReducer(state, {type: 'set-address', target: 'identityAddress', address: nextAddress});
    expect(state.draft.domicileAddress.addressLine).toBe('Alamat baru');
    state = onboardingReducer(state, {type: 'set-education', education: {...draft.educations[0], schoolName: 'UI'}});
    expect(state.draft.educations).toHaveLength(1);
    expect(state.draft.educations[0].schoolName).toBe('UI');
  });

  test('mapper menormalisasi nomor dan membentuk payload backend', () => {
    const payload = toOnboardingPayload(completeDraft());
    expect(payload.phone).toBe('6281234567890');
    expect(payload.same_as_ktp).toBe(true);
    expect(payload.domicile_address_detail).toBeNull();
    expect(payload.no_pengalaman_kerja).toBe(true);
    expect(payload.skills[0]).toMatchObject({skill_id: 12, name: 'Kanban'});
    expect(payload.educations[0]).toMatchObject({major_id: 17, major_name: 'Manajemen'});
  });

  test('mapper current onboarding memakai field backend', () => {
    const draft = mapCurrentOnboarding({data: {user: {full_name: 'Azka'}, job_seeker: {gender: 'male', birth_date: '1993-05-10T00:00:00Z', no_pengalaman_kerja: 1, educations: [{id: 4, education_level: 'S1', major_id: 17, major: {id: 17, name: 'Manajemen'}}]}}});
    expect(draft.fullName).toBe('Azka');
    expect(draft.birthDate).toBe('1993-05-10');
    expect(draft.hasNoExperience).toBe(true);
    expect(draft.educations[0]).toMatchObject({majorId: 17, majorName: 'Manajemen'});
  });
});
