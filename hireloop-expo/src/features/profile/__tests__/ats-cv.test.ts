import {buildAtsCvDocument, buildAtsCvLines, createAtsPdfBytes} from '../ats-cv';
import {mapCandidateProfile} from '../profile.mapper';

jest.mock('expo-file-system', () => ({File: jest.fn(), Paths: {cache: 'cache://'}}));
jest.mock('expo-sharing', () => ({isAvailableAsync: jest.fn(), shareAsync: jest.fn()}));

describe('ATS CV', () => {
  it('builds searchable profile content and a valid PDF envelope', () => {
    const profile = mapCandidateProfile({data: {
      user: {email: 'andi@example.com'},
      job_seeker: {
        full_name: 'Andi Pratama',
        phone: '081234567890',
        self_description: 'Frontend developer berpengalaman membangun aplikasi yang mudah digunakan.',
        experiences: [{
          id: 1,
          position: 'Frontend Developer',
          company_name: 'HireLoop',
          start_date: '2025-01-01',
          is_current: true,
          description: '- Mengembangkan aplikasi kandidat.\n- Menjaga kualitas antarmuka.',
          skills: [{id: 7, name: 'React'}, {id: 8, name: 'TypeScript'}],
        }],
        educations: [{
          id: 2,
          education_level: 'S1',
          school_name: 'Universitas HireLoop',
          major_name: 'Teknik Informatika',
          start_date: '2020-08-01',
          end_date: '2024-07-01',
        }],
        skills: [{id: 7, skill_id: 7, name: 'React'}],
        documents: [{id: 3, name: 'CV Utama', file_path: 'cv.pdf', original_name: 'cv.pdf'}],
        certifications: [
          {id: 5, name: 'C Learner', issuer: 'Sololearn', issued_date: '01/12/2021', no_expiry: true, expired_date: '2022-12-01'},
          {
            id: 4,
            name: 'Sertifikat K3',
            issuer: 'BNSP',
            issued_date: '2026-01-01',
            expired_date: '2028-01-01',
            credential_id: 'K3-927',
            media: [{path: 'cert/k3.pdf', original_name: 'scan-k3.pdf'}],
          },
        ],
      },
    }});

    const lines = buildAtsCvLines(profile);
    const document = buildAtsCvDocument(profile);
    const pdf = createAtsPdfBytes(document);
    const pdfSource = String.fromCharCode(...pdf);
    const text = String.fromCharCode(...pdf.slice(0, 8));

    expect(lines.join(' ')).toContain('Andi Pratama');
    expect(lines.join(' ')).toContain('Frontend Developer');
    expect(lines.join(' ')).toContain('React');
    expect(lines.join(' ')).toContain('TypeScript');
    expect(lines.join(' ')).toContain('Universitas HireLoop');
    expect(lines.join(' ')).toContain('CV Utama');
    expect(lines.join(' ')).toContain('Sertifikat K3');
    expect(document.sections.map(section => section.title)).toEqual([
      'Ringkasan Profesional',
      'Keahlian',
      'Pengalaman Kerja',
      'Pendidikan',
      'Sertifikasi dan Pelatihan',
      'Dokumen',
    ]);
    expect(text).toBe('%PDF-1.4');
    expect(pdfSource).toContain('/BaseFont /Helvetica-Bold');
    expect(pdfSource).toContain('(RINGKASAN PROFESIONAL)');
    expect(pdfSource).toMatch(/0\.90 w .* m .* l S/);
    expect(pdfSource).toContain('(Januari 2025 - Sekarang)');
    expect(pdfSource).toContain('(Agustus 2020 - Juli 2024)');
    expect(pdfSource).toContain('(Sertifikat K3 | BNSP)');
    expect(pdfSource).toContain('(Januari 2026 - Januari 2028)');
    expect(pdfSource).toContain('(Desember 2021 - Sekarang)');
    expect(pdfSource).not.toMatch(/K3-927|scan-k3\.pdf|cv\.pdf/);
    expect(document.sections.find(section => section.title === 'Sertifikasi dan Pelatihan')?.items).toEqual([
      {title: 'Sertifikat K3 | BNSP', period: 'Januari 2026 - Januari 2028', bullets: []},
      {title: 'C Learner | Sololearn', period: 'Desember 2021 - Sekarang', bullets: []},
    ]);
    expect(document.sections.find(section => section.title === 'Dokumen')?.items).toEqual([
      {title: 'CV Utama', period: '', bullets: []},
    ]);
  });
});
