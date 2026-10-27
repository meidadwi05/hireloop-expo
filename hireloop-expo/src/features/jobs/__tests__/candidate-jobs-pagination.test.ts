import {deduplicateJobs, getNextJobsPage} from '../jobs.pagination';
import type {CandidateJobCard} from '../jobs.types';

function job(key: string): CandidateJobCard {
  const [source, rawId] = key.split(':');
  return {
    id: Number(rawId),
    key,
    source: source === 'project-lowongan' ? 'project-lowongan' : 'job-posting',
    title: 'Job',
    company: 'Company',
    location: 'Jakarta',
    contractType: 'Full Time',
    workMode: 'On Site',
    salaryLabel: 'Gaji tidak disebutkan',
    urgent: false,
    active: true,
    skills: [],
    applicantsCount: 0,
    closingDate: null,
    publishedAt: null,
    updatedAt: null,
    closingLabel: 'Batas akhir tidak ditentukan',
    publishedLabel: 'Tayang baru-baru ini',
    updatedLabel: 'Diperbarui terbaru',
    workType: 'On Site',
    salary: 'Gaji tidak disebutkan',
  };
}

describe('candidate job pagination helpers', () => {
  it('stops at the last page', () => {
    expect(getNextJobsPage({currentPage: 1, lastPage: 2})).toBe(2);
    expect(getNextJobsPage({currentPage: 2, lastPage: 2})).toBeUndefined();
  });

  it('deduplicates equal source and id while preserving different sources', () => {
    const result = deduplicateJobs([
      job('job-posting:1'),
      job('job-posting:1'),
      job('project-lowongan:1'),
    ]);

    expect(result.map(item => item.key)).toEqual(['job-posting:1', 'project-lowongan:1']);
  });
});
