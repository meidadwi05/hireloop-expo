import {mapJobCard, mapJobDetail} from '../jobs.mapper';

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

  it('extracts only benefit names from a JSON string', () => {
    const result = mapJobDetail({
      data: {
        id: 14,
        nama_lowongan: 'Operator Produksi',
        benefit: JSON.stringify([
          {nama: 'BPJS Kesehatan & Ketenagakerjaan', status: 'Wajib'},
          {nama: 'THR', status: 'Wajib'},
          {nama: 'Uang Makan', status: 'Wajib'},
        ]),
      },
    }, 'project-lowongan');

    expect(result.benefits).toEqual([
      'BPJS Kesehatan & Ketenagakerjaan',
      'THR',
      'Uang Makan',
    ]);
    expect(result.benefits.join(' ')).not.toContain('status');
    expect(result.benefits.join(' ')).not.toContain('Wajib');
  });

  it('extracts benefit names when the API already returns an array', () => {
    const result = mapJobDetail({
      id: 15,
      benefits: [
        {nama: 'Asuransi Kesehatan', status: 'Opsional'},
        {name: 'Tunjangan Transportasi', status: 'Wajib'},
      ],
    }, 'job-posting');

    expect(result.benefits).toEqual(['Asuransi Kesehatan', 'Tunjangan Transportasi']);
  });

  it('normalizes production detail sections like the candidate web', () => {
    const result = mapJobDetail({
      data: {
        id: 18,
        nama_lowongan: 'Operator Produksi',
        deskripsi_pekerjaan: 'Mengoperasikan mesin\nMenjaga kebersihan area kerja',
        kualifikasi: ['Teliti dan disiplin', 'Bersedia bekerja shift'],
        gender: 'Semua',
        usia_minimal: 20,
        usia_maximal: 21,
        pendidikan_minimal: 'SMA/SMK',
        pengalaman: 0,
        tanpa_pengalaman: true,
        keahlian: ['Quality Control', 'Adaptability'],
        benefit: [
          {nama: 'Tunjangan Makan', keterangan: 'Setiap hari kerja'},
          {nama: 'THR'},
        ],
      },
    }, 'project-lowongan');

    expect(result.descriptionItems).toEqual(['Mengoperasikan mesin', 'Menjaga kebersihan area kerja']);
    expect(result.additionalQualifications).toEqual([
      'Laki-laki / Perempuan',
      'Usia 20 - 21 tahun',
      'Pendidikan minimal SMA/SMK',
      'Tanpa pengalaman',
    ]);
    expect(result.requirements).toEqual(['Teliti dan disiplin', 'Bersedia bekerja shift']);
    expect(result.skills).toEqual(['Quality Control', 'Adaptability']);
    expect(result.benefits).toEqual(['Tunjangan Makan - Setiap hari kerja', 'THR']);
  });

  it('deduplicates list values and safely handles malformed detail fields', () => {
    const result = mapJobDetail({
      id: 19,
      description: 'Analisis data;Analisis data',
      requirements: '[malformed',
      benefits: null,
    }, 'job-posting');

    expect(result.descriptionItems).toEqual(['Analisis data']);
    expect(result.requirements).toEqual(['[malformed']);
    expect(result.additionalQualifications).toEqual([]);
    expect(result.benefits).toEqual([]);
  });

  it('maps dynamic application requirements from the production vacancy contract', () => {
    const result = mapJobDetail({
      data: {
        id: 20,
        nama_lowongan: 'Operator Produksi',
        persyaratan_dokumen: JSON.stringify([
          {dokumen: 'CV', status: 'Wajib'},
          {dokumen: 'Ijazah', status: 'Opsional'},
        ]),
        sertifikasi_list: [{sertifikasi: 'Sertifikat K3', status: 'Wajib'}],
        cek_hubungan_keluarga: 'Ya',
        deteksi_hubungan_ayah_ibu: true,
        deteksi_hubungan_suami_istri: true,
        kebijakan_lainnya: [{pertanyaan: 'Bersedia bekerja shift?', status: 'Wajib'}],
      },
    }, 'project-lowongan');

    expect(result.documentRequirements).toEqual([
      {label: 'CV', group: 'dokumen', required: true},
      {label: 'Ijazah', group: 'dokumen', required: false},
      {label: 'Sertifikat K3', group: 'sertifikasi', required: true},
    ]);
    expect(result.familyRequirements).toEqual([
      {key: 'nama_ayah', label: 'Nama Lengkap Bapak', required: true},
      {key: 'nama_ibu', label: 'Nama Lengkap Ibu', required: true},
      {key: 'nama_pasangan', label: 'Nama Lengkap Suami/Istri', required: false},
    ]);
    expect(result.policies).toEqual([
      {key: 'policy-0', name: 'Bersedia bekerja shift?', required: true},
    ]);
  });
});
