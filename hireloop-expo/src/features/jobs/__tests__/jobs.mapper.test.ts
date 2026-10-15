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

    expect(result.id).toBe('job-posting-7');
    expect(result.title).toBe('Mobile Developer');
    expect(result.skills).toEqual(['React Native', 'TypeScript']);
    expect(result.salary).toContain('8.000.000');
  });

  it('provides safe fallbacks for incomplete responses', () => {
    const result = mapJobCard({}, 3);
    expect(result.title).toBe('Posisi Pekerjaan');
    expect(result.company).toBe('Perusahaan HireLoop');
    expect(result.skills.length).toBeGreaterThan(0);
  });
});
