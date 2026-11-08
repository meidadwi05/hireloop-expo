import type {CandidateJobCard} from './jobs.types';

export type SavedJobsSort = 'newest' | 'oldest';
export type SavedJobsStatus = 'all' | 'active' | 'closed';

export type SavedJobsFilters = {
  location: string;
  search: string;
  sort: SavedJobsSort;
  status: SavedJobsStatus;
};

export type SavedJobsStatusCounts = Record<SavedJobsStatus, number>;

function jobTimestamp(job: CandidateJobCard): number {
  return Date.parse(job.updatedAt ?? job.publishedAt ?? '') || 0;
}

function matchesSearchAndLocation(job: CandidateJobCard, search: string, location: string): boolean {
  const keyword = search.trim().toLocaleLowerCase('id-ID');
  const matchesKeyword = !keyword || [job.title, job.company, job.location]
    .some(value => value.toLocaleLowerCase('id-ID').includes(keyword));
  const matchesLocation = location === 'all'
    || job.location.toLocaleLowerCase('id-ID') === location.toLocaleLowerCase('id-ID');

  return matchesKeyword && matchesLocation;
}

export function getSavedJobLocations(jobs: CandidateJobCard[]): string[] {
  return Array.from(new Set(jobs.map(job => job.location.trim()).filter(Boolean)))
    .sort((left, right) => left.localeCompare(right, 'id-ID'));
}

export function countSavedJobsByStatus(
  jobs: CandidateJobCard[],
  search: string,
  location: string,
): SavedJobsStatusCounts {
  const matchingJobs = jobs.filter(job => matchesSearchAndLocation(job, search, location));

  return {
    all: matchingJobs.length,
    active: matchingJobs.filter(job => job.active).length,
    closed: matchingJobs.filter(job => !job.active).length,
  };
}

export function filterAndSortSavedJobs(
  jobs: CandidateJobCard[],
  filters: SavedJobsFilters,
): CandidateJobCard[] {
  const filtered = jobs.filter(job => {
    if (!matchesSearchAndLocation(job, filters.search, filters.location)) return false;
    if (filters.status === 'active') return job.active;
    if (filters.status === 'closed') return !job.active;
    return true;
  });

  return filtered.sort((left, right) => {
    const dateDifference = jobTimestamp(left) - jobTimestamp(right);
    const difference = dateDifference || left.id - right.id;
    return filters.sort === 'newest' ? -difference : difference;
  });
}
