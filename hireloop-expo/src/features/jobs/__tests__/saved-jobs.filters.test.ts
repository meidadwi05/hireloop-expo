import type {CandidateJobCard} from '../jobs.types';
import {filterAndSortSavedJobs} from '../saved-jobs.filters';

function job(overrides: Partial<CandidateJobCard>): CandidateJobCard {
  return {
    id: 1,
    key: 'job-posting:1',
    source: 'job-posting',
    title: 'Frontend Developer',
    company: 'HireLoop Indonesia',
    location: 'Jakarta',
    contractType: 'Full Time',
    workMode: 'On Site',
    salaryLabel: 'Rp5.000.000',
    urgent: false,
    active: true,
    skills: [],
    applicantsCount: 0,
    closingDate: null,
    publishedAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-02T00:00:00Z',
    closingLabel: '-',
    publishedLabel: '-',
    updatedLabel: '-',
    workType: 'Full Time',
    salary: 'Rp5.000.000',
    ...overrides,
  };
}

describe('filterAndSortSavedJobs', () => {
  const jobs = [
    job({id: 1, key: 'job-posting:1'}),
    job({id: 2, key: 'project-lowongan:2', source: 'project-lowongan', title: 'Operator Produksi', company: 'PT Industri', location: 'Karawang', updatedAt: '2026-02-02T00:00:00Z'}),
  ];

  it.each([
    ['Operator', 2],
    ['Industri', 2],
    ['Karawang', 2],
  ])('mencari judul, perusahaan, dan lokasi dengan kata %s', (keyword, expectedId) => {
    expect(filterAndSortSavedJobs(jobs, keyword, 'newest').map(item => item.id)).toEqual([expectedId]);
  });

  it('mengurutkan terbaru dan terlama tanpa mengubah array sumber', () => {
    expect(filterAndSortSavedJobs(jobs, '', 'newest').map(item => item.id)).toEqual([2, 1]);
    expect(filterAndSortSavedJobs(jobs, '', 'oldest').map(item => item.id)).toEqual([1, 2]);
    expect(jobs.map(item => item.id)).toEqual([1, 2]);
  });
});
