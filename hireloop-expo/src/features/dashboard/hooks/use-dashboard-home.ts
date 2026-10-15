import {useQuery} from '@tanstack/react-query';

import {jobsApi} from '../../jobs/api/jobs.api';
import {jobsKeys} from '../../jobs/jobs.keys';
import {notificationsApi} from '../../notifications/api/notifications.api';
import {notificationsKeys} from '../../notifications/notifications.keys';
import {dashboardApi} from '../api/dashboard.api';
import {dashboardKeys} from '../dashboard.keys';

export function useDashboardHome() {
  const dashboard = useQuery({queryKey: dashboardKeys.home(), queryFn: dashboardApi.get});
  const jobs = useQuery({
    queryKey: jobsKeys.list({priority: 'all', page: 1, per_page: 8}),
    queryFn: () => jobsApi.list({priority: 'all', page: 1, per_page: 8}),
  });
  const unread = useQuery({queryKey: notificationsKeys.unreadCount(), queryFn: notificationsApi.unreadCount});

  const refresh = async () => {
    await Promise.all([dashboard.refetch(), jobs.refetch(), unread.refetch()]);
  };

  const failedCount = [dashboard, jobs, unread].filter(query => query.isError).length;

  return {
    interviews: dashboard.data?.interviews ?? [],
    jobs: jobs.data ?? [],
    unread: unread.data ?? 0,
    jobsLoading: jobs.isLoading,
    refreshing: dashboard.isRefetching || jobs.isRefetching || unread.isRefetching,
    error: failedCount === 3
      ? 'Dashboard belum dapat dimuat. Periksa koneksi Anda dan coba lagi.'
      : failedCount > 0
        ? 'Sebagian data belum dapat dimuat. Tarik ke bawah untuk mencoba lagi.'
        : '',
    refresh,
  };
}
