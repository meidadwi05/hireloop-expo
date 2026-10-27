import type {CandidateJobCard} from './jobs.types';

export function getNextJobsPage(lastPage: {currentPage: number; lastPage: number}): number | undefined {
  return lastPage.currentPage < lastPage.lastPage ? lastPage.currentPage + 1 : undefined;
}

export function deduplicateJobs(items: CandidateJobCard[]): CandidateJobCard[] {
  return Array.from(new Map(items.map(item => [item.key, item])).values());
}
