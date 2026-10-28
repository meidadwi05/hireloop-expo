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
        },
      },
    });

    expect(profile.userId).toBe(25);
    expect(profile.fullName).toBe('Zaki Wirawan');
    expect(profile.birthDate).toBe('13/12/2000');
    expect(profile.preferredWorkTypes).toEqual(['full_time', 'kontrak']);
    expect(profile.jobPreferences).toEqual([{id: 9, name: 'Data Analyst'}]);
    expect(profile.educations[0].educationLevel).toBe('S1');
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

  it('calculates completion deterministically', () => {
    const profile = mapCandidateProfile({data: {user: {email: 'zaki@example.com'}, job_seeker: {full_name: 'Zaki'}}});
    expect(calculateProfileCompletion(profile)).toBe(20);
  });
});
