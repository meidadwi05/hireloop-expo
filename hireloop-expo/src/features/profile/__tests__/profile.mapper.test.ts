import {
  calculateProfileCompletion,
  formatAddress,
  mapCandidateProfile,
  mapProfileFiles,
} from '../profile.mapper';

describe('profile mapper', () => {
  it('maps the Laravel profile envelope without leaking backend field names', () => {
    const profile = mapCandidateProfile({
      success: true,
      data: {
        user: {id: 25, email: 'zaki@example.com', full_name: 'Zaki Wirawan'},
        job_seeker: {
          id: 7,
          nik: '3275010101900001',
          full_name: 'Zaki Wirawan',
          gender: 'male',
          birth_date: '13/12/2000',
          same_as_ktp: true,
          ktp_address_detail: {
            address_line: 'Jl. HireLoop 1',
            province_code: '32',
            province_name: 'Jawa Barat',
            regency_code: '32.75',
            regency_name: 'Bekasi',
            district_code: '32.75.01',
            village_code: '32.75.01.1001',
          },
          preferred_work_types: ['full_time', 'kontrak'],
          preferred_work_settings: ['remote'],
          job_preferences: [{role_taxonomy_id: 9, role_name: 'Data Analyst'}],
          expected_locations: ['Jakarta'],
          educations: [{id: 2, education_level: 'S1', school_name: 'Universitas HireLoop'}],
          experiences: [{
            id: 4,
            position: 'Frontend Developer',
            company_name: 'HireLoop',
            start_date: '2025-01-01',
            is_current: true,
            skills: [{id: 9, name: 'React'}],
          }],
        },
      },
    });

    expect(profile.userId).toBe(25);
    expect(profile.fullName).toBe('Zaki Wirawan');
    expect(profile.birthDate).toBe('13/12/2000');
    expect(profile.preferredWorkTypes).toEqual(['full_time', 'kontrak']);
    expect(profile.jobPreferences).toEqual([{id: 9, name: 'Data Analyst'}]);
    expect(profile.educations[0].educationLevel).toBe('S1');
    expect(profile.experiences[0].skills).toEqual([{id: 9, name: 'React'}]);
    expect(formatAddress(profile.ktpAddress)).toContain('Bekasi');
  });

  it('maps mixed document and certification responses', () => {
    const files = mapProfileFiles([
      {
        key: 'document:1', id: 1, type: 'document', name: 'CV', file_path: 'profile-files/25/cv.pdf',
        original_name: 'cv.pdf', mime_type: 'application/pdf', file_size: 1024,
      },
      {
        key: 'certification:2', id: 2, type: 'certification', name: 'Sertifikat K3', issuer: 'BNSP',
        issued_date: '2026-02-01', media: [{type: 'file', path: 'profile-files/25/k3.pdf', original_name: 'k3.pdf', size: 2048}],
      },
    ]);

    expect(files).toHaveLength(2);
    expect(files[0]).toMatchObject({type: 'document', originalName: 'cv.pdf', size: 1024});
    expect(files[1]).toMatchObject({type: 'certification', issuer: 'BNSP', originalName: 'k3.pdf'});
  });

  it('keeps skill entry ids separate from legacy dataset skill ids', () => {
    const current = mapCandidateProfile({data: {job_seeker: {skills: [
      {id: 9, pivot_id: 41, skill_id: 9, name: 'React', source: 'master'},
      {id: 52, skill_id: null, custom_name: 'Prompt Engineering', source: 'custom'},
    ]}}});
    const legacy = mapCandidateProfile({data: {job_seeker: {skills: [
      {id: 12, skill_id: 12, name: 'Figma', source: 'master'},
    ]}}});

    expect(current.skillItems[0]).toMatchObject({entryId: 41, skillId: 9, source: 'dataset'});
    expect(current.skillItems[1]).toMatchObject({entryId: 52, skillId: null, source: 'custom'});
    expect(legacy.skillItems[0]).toMatchObject({entryId: null, skillId: 12, source: 'dataset'});
  });

  it('normalizes legacy work preference values', () => {
    const profile = mapCandidateProfile({data: {job_seeker: {
      job_type_expected: 'onsite',
      work_type: 'contract',
      work_period_status: 'Siap Bekerja',
      preferred_work_types: ['part_time', 'Magang'],
      preferred_work_settings: ['onsite', 'remote'],
    }}});

    expect(profile.jobTypeExpected).toBe('on_site');
    expect(profile.workType).toBe('kontrak');
    expect(profile.workPeriodStatus).toBe('available');
    expect(profile.preferredWorkTypes).toEqual(['paruh_waktu', 'internship']);
    expect(profile.preferredWorkSettings).toEqual(['on_site', 'remote']);
  });

  it('calculates completion deterministically', () => {
    const profile = mapCandidateProfile({data: {user: {email: 'zaki@example.com'}, job_seeker: {full_name: 'Zaki'}}});
    expect(calculateProfileCompletion(profile)).toBe(20);
  });
});
