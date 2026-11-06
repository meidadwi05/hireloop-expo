import type {CandidateJobCard} from './jobs.types';

export type SavedJobsSort = 'newest' | 'oldest';

function jobTimestamp(job: CandidateJobCard): number {
  return Date.parse(job.updatedAt ?? job.publishedAt ?? '') || 0;
}

export function filterAndSortSavedJobs(
  jobs: CandidateJobCard[],
  search: string,
  sort: SavedJobsSort,
): CandidateJobCard[] {
  const keyword = search.trim().toLocaleLowerCase('id-ID');
  const filtered = keyword
    ? jobs.filter(job => [job.title, job.company, job.location]
        .some(value => value.toLocaleLowerCase('id-ID').includes(keyword)))
    : [...jobs];

  return filtered.sort((left, right) => {
    const dateDifference = jobTimestamp(left) - jobTimestamp(right);
    const difference = dateDifference || left.id - right.id;
    return sort === 'newest' ? -difference : difference;
  });
}
