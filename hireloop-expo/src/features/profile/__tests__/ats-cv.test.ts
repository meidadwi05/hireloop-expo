jest.mock('expo-file-system', () => ({File: jest.fn(), Paths: {cache: 'cache://'}}));
jest.mock('expo-sharing', () => ({isAvailableAsync: jest.fn(), shareAsync: jest.fn()}));

import {buildAtsCvLines, createAtsPdfBytes} from '../ats-cv';
import {mapCandidateProfile} from '../profile.mapper';

describe('ATS CV', () => {
  it('builds searchable profile content and a valid PDF envelope', () => {
    const profile = mapCandidateProfile({data: {
      user: {email: 'andi@example.com'},
      job_seeker: {
        full_name: 'Andi Pratama',
        phone: '081234567890',
        self_description: 'Frontend developer berpengalaman.',
        experiences: [{
          id: 1,
          position: 'Frontend Developer',
          company_name: 'HireLoop',
          start_date: '2025-01-01',
          is_current: true,
          skills: [{id: 7, name: 'React'}],
        }],
        skills: [{id: 7, skill_id: 7, name: 'React'}],
      },
    }});

    const lines = buildAtsCvLines(profile);
    const pdf = createAtsPdfBytes(lines);
    const text = String.fromCharCode(...pdf.slice(0, 8));

    expect(lines.join(' ')).toContain('Andi Pratama');
    expect(lines.join(' ')).toContain('Frontend Developer');
    expect(lines.join(' ')).toContain('React');
    expect(text).toBe('%PDF-1.4');
  });
});
