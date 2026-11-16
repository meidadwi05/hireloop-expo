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
          skills: [{id: 7, name: 'React'}],
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
    expect(lines.join(' ')).toContain('Universitas HireLoop');
    expect(document.sections.map(section => section.title)).toEqual([
      'Ringkasan Profesional',
      'Keahlian',
      'Pengalaman Kerja',
      'Pendidikan',
    ]);
    expect(text).toBe('%PDF-1.4');
    expect(pdfSource).toContain('/BaseFont /Helvetica-Bold');
    expect(pdfSource).toContain('(RINGKASAN PROFESIONAL)');
    expect(pdfSource).toMatch(/0\.90 w .* m .* l S/);
    expect(pdfSource).toContain('(Januari 2025 - Sekarang)');
  });
});
