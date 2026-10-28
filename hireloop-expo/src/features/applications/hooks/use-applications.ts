import {useQuery} from '@tanstack/react-query';

import {useAuth} from '../../auth/auth-provider';
import {applicationsApi} from '../api/applications.api';
import {applicationsKeys} from '../applications.keys';
import {mapApplications} from '../applications.mapper';
import {rawApplicationSchema} from '../applications.schemas';

export function useApplications() {
  const {user} = useAuth();
  const initialData = mapApplications(
    (user?.job_applications ?? [])
      .map(item => rawApplicationSchema.safeParse(item))
      .filter(result => result.success)
      .map(result => result.data),
  );

  return useQuery({
    queryKey: applicationsKeys.list(),
    queryFn: applicationsApi.list,
    initialData,
    staleTime: 30_000,
  });
}
