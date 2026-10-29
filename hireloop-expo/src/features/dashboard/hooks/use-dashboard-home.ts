import {useQuery} from '@tanstack/react-query';

import {authApi} from '../../auth/api/auth.api';
import {useAuth} from '../../auth/auth-provider';
import {mapApplications} from '../../applications/applications.mapper';
import {rawApplicationSchema} from '../../applications/applications.schemas';
import {jobsApi} from '../../jobs/api/jobs.api';
import {jobsKeys} from '../../jobs/jobs.keys';
import {notificationsApi} from '../../notifications/api/notifications.api';
import {notificationsKeys} from '../../notifications/notifications.keys';
import {dashboardApi} from '../api/dashboard.api';
import {dashboardKeys} from '../dashboard.keys';

export function useDashboardHome() {
  const {user} = useAuth();
  const dashboard = useQuery({queryKey: dashboardKeys.home(), queryFn: dashboardApi.get});
  const candidate = useQuery({
    queryKey: [...dashboardKeys.home(), 'candidate'],
    queryFn: authApi.getCurrentUser,
    initialData: user ?? undefined,
    staleTime: 30_000,
  });
  const jobs = useQuery({
    queryKey: jobsKeys.list({priority: 'all', page: 1, per_page: 8}),
    queryFn: () => jobsApi.list({priority: 'all', page: 1, per_page: 8}),
  });
  const unread = useQuery({queryKey: notificationsKeys.unreadCount(), queryFn: notificationsApi.unreadCount});

  const refresh = async () => {
    await Promise.all([dashboard.refetch(), candidate.refetch(), jobs.refetch(), unread.refetch()]);
  };

  const failedCount = [dashboard, candidate, jobs, unread].filter(query => query.isError).length;
  const applications = mapApplications(
    (candidate.data?.job_applications ?? [])
      .map(item => rawApplicationSchema.safeParse(item))
      .filter(result => result.success)
      .map(result => result.data),
  );

  return {
    applications,
    candidate: candidate.data ?? user,
    interviews: dashboard.data?.interviews ?? [],
    jobs: jobs.data ?? [],
    unread: unread.data ?? 0,
    jobsLoading: jobs.isLoading,
    refreshing: dashboard.isRefetching || candidate.isRefetching || jobs.isRefetching || unread.isRefetching,
    error: failedCount === 4
      ? 'Dashboard belum dapat dimuat. Periksa koneksi Anda dan coba lagi.'
      : failedCount > 0
        ? 'Sebagian data belum dapat dimuat. Tarik ke bawah untuk mencoba lagi.'
        : '',
    refresh,
  };
}
