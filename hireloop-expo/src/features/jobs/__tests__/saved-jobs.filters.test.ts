import type {CandidateJobCard} from '../jobs.types';
import {countSavedJobsByStatus, filterAndSortSavedJobs, getSavedJobLocations} from '../saved-jobs.filters';

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
    job({id: 2, key: 'project-lowongan:2', source: 'project-lowongan', title: 'Operator Produksi', company: 'PT Industri', location: 'Karawang', active: false, updatedAt: '2026-02-02T00:00:00Z'}),
  ];

  const filters = {location: 'all', search: '', sort: 'newest' as const, status: 'all' as const};

  it.each([
    ['Operator', 2],
    ['Industri', 2],
    ['Karawang', 2],
  ])('mencari judul, perusahaan, dan lokasi dengan kata %s', (keyword, expectedId) => {
    expect(filterAndSortSavedJobs(jobs, {...filters, search: keyword}).map(item => item.id)).toEqual([expectedId]);
  });

  it('mengurutkan terbaru dan terlama tanpa mengubah array sumber', () => {
    expect(filterAndSortSavedJobs(jobs, filters).map(item => item.id)).toEqual([2, 1]);
    expect(filterAndSortSavedJobs(jobs, {...filters, sort: 'oldest'}).map(item => item.id)).toEqual([1, 2]);
    expect(jobs.map(item => item.id)).toEqual([1, 2]);
  });

  it('memfilter lokasi dan status lowongan tersimpan', () => {
    expect(filterAndSortSavedJobs(jobs, {...filters, location: 'Jakarta'}).map(item => item.id)).toEqual([1]);
    expect(filterAndSortSavedJobs(jobs, {...filters, status: 'active'}).map(item => item.id)).toEqual([1]);
    expect(filterAndSortSavedJobs(jobs, {...filters, status: 'closed'}).map(item => item.id)).toEqual([2]);
  });

  it('menghasilkan opsi lokasi unik dan jumlah status dinamis', () => {
    expect(getSavedJobLocations(jobs)).toEqual(['Jakarta', 'Karawang']);
    expect(countSavedJobsByStatus(jobs, '', 'all')).toEqual({all: 2, active: 1, closed: 1});
    expect(countSavedJobsByStatus(jobs, '', 'Karawang')).toEqual({all: 1, active: 0, closed: 1});
  });
});
