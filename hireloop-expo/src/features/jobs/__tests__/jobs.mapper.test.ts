import {mapJobCard} from '../jobs.mapper';

describe('mapJobCard', () => {
  it('maps a wrapped candidate job response into a UI-safe model', () => {
    const result = mapJobCard({
      source: 'job-posting',
      job: {
        id: 7,
        title: 'Mobile Developer',
        company_name: 'HireLoop',
        location: 'Jakarta',
        salary_min: 8_000_000,
        salary_max: 12_000_000,
        skills: [{name: 'React Native'}, {name: 'TypeScript'}],
      },
    }, 0);

    expect(result.id).toBe(7);
    expect(result.key).toBe('job-posting:7');
    expect(result.title).toBe('Mobile Developer');
    expect(result.skills).toEqual(['React Native', 'TypeScript']);
    expect(result.salary).toContain('8.000.000');
  });

  it('provides safe fallbacks for incomplete responses', () => {
    const result = mapJobCard({}, 3);
    expect(result.title).toBe('Posisi Pekerjaan');
    expect(result.company).toBe('Perusahaan HireLoop');
    expect(result.skills).toEqual([]);
    expect(result.salaryLabel).toBe('Gaji tidak disebutkan');
  });

  it('normalizes a project vacancy without fabricating missing values', () => {
    const result = mapJobCard({
      source: 'project-lowongan',
      job: {
        id: 9,
        nama_lowongan: 'Operator Produksi',
        project: {client: 'PT Contoh'},
        lokasi_kerja: 'Karawang',
        jenis_kontrak: 'full_time',
        pengaturan_tempat_kerja: 'on_site',
        gaji_tidak_disebutkan: true,
        keahlian: ['Quality Control', 'Adaptability'],
        applicants_count: 4,
        prioritas_hiring: 'high',
        status_lowongan: 'published',
      },
    });

    expect(result.key).toBe('project-lowongan:9');
    expect(result.company).toBe('PT Contoh');
    expect(result.contractType).toBe('Full Time');
    expect(result.workMode).toBe('On Site');
    expect(result.salaryLabel).toBe('Gaji tidak disebutkan');
    expect(result.applicantsCount).toBe(4);
    expect(result.urgent).toBe(true);
  });
});
