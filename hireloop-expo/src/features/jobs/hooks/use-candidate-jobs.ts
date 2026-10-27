import {useInfiniteQuery} from '@tanstack/react-query';
import {useEffect, useMemo, useState} from 'react';

import {jobsApi} from '../api/jobs.api';
import {jobsKeys} from '../jobs.keys';
import {deduplicateJobs, getNextJobsPage} from '../jobs.pagination';
import type {CandidateJobQuery} from '../jobs.types';

export function useCandidateJobs(priority: NonNullable<CandidateJobQuery['priority']>) {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const queryParams = useMemo(() => ({
    search: debouncedSearch || undefined,
    priority,
    per_page: 12,
  } satisfies Omit<CandidateJobQuery, 'page'>), [debouncedSearch, priority]);

  const query = useInfiniteQuery({
    queryKey: jobsKeys.infinite(queryParams),
    queryFn: ({pageParam}) => jobsApi.listPage({...queryParams, page: pageParam}),
    initialPageParam: 1,
    getNextPageParam: getNextJobsPage,
  });

  const items = useMemo(
    () => deduplicateJobs(query.data?.pages.flatMap(page => page.items) ?? []),
    [query.data?.pages],
  );

  return {
    ...query,
    items,
    total: query.data?.pages[0]?.total ?? 0,
    search,
    setSearch,
    debouncedSearch,
  };
}
