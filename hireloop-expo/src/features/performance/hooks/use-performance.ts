import {useQuery} from '@tanstack/react-query';

import {performanceApi} from '../api/performance.api';
import {performanceKeys} from '../performance.keys';

export function usePerformance() {
  return useQuery({
    queryKey: performanceKeys.list(),
    queryFn: performanceApi.get,
    staleTime: 30_000,
  });
}

