import {type InfiniteData, useInfiniteQuery, useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useMemo} from 'react';

import {notificationsApi} from '../api/notifications.api';
import {deduplicateNotifications} from '../notifications.mapper';
import {notificationsKeys} from '../notifications.keys';
import type {NotificationsPage} from '../notifications.types';

const PER_PAGE = 20;

function updatePages(
  current: InfiniteData<NotificationsPage> | undefined,
  transform: (page: NotificationsPage) => NotificationsPage,
) {
  return current ? {...current, pages: current.pages.map(transform)} : current;
}

export function useNotifications() {
  const queryClient = useQueryClient();
  const queryKey = notificationsKeys.infinite(PER_PAGE);
  const query = useInfiniteQuery({
    queryKey,
    queryFn: ({pageParam}) => notificationsApi.list({page: pageParam, per_page: PER_PAGE}),
    initialPageParam: 1,
    getNextPageParam: lastPage => lastPage.currentPage < lastPage.lastPage
      ? lastPage.currentPage + 1
      : undefined,
  });
  const unreadQuery = useQuery({
    queryKey: notificationsKeys.unreadCount(),
    queryFn: notificationsApi.unreadCount,
  });

  const markReadMutation = useMutation({
    mutationFn: notificationsApi.markRead,
    onMutate: async notificationId => {
      await Promise.all([
        queryClient.cancelQueries({queryKey}),
        queryClient.cancelQueries({queryKey: notificationsKeys.unreadCount()}),
      ]);
      const previousPages = queryClient.getQueryData<InfiniteData<NotificationsPage>>(queryKey);
      const previousUnread = queryClient.getQueryData<number>(notificationsKeys.unreadCount());
      const targetWasUnread = previousPages?.pages.some(page => page.items.some(item => item.id === String(notificationId) && !item.isRead));

      queryClient.setQueryData<InfiniteData<NotificationsPage>>(queryKey, current => updatePages(current, page => ({
        ...page,
        items: page.items.map(item => item.id === String(notificationId) ? {...item, isRead: true} : item),
      })));
      if (targetWasUnread) {
        queryClient.setQueryData<number>(notificationsKeys.unreadCount(), current => Math.max(0, (current ?? 0) - 1));
      }
      return {previousPages, previousUnread};
    },
    onError: (_error, _notificationId, context) => {
      if (context?.previousPages) queryClient.setQueryData(queryKey, context.previousPages);
      if (context?.previousUnread !== undefined) queryClient.setQueryData(notificationsKeys.unreadCount(), context.previousUnread);
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: notificationsApi.markAllRead,
    onMutate: async () => {
      await Promise.all([
        queryClient.cancelQueries({queryKey}),
        queryClient.cancelQueries({queryKey: notificationsKeys.unreadCount()}),
      ]);
      const previousPages = queryClient.getQueryData<InfiniteData<NotificationsPage>>(queryKey);
      const previousUnread = queryClient.getQueryData<number>(notificationsKeys.unreadCount());
      queryClient.setQueryData<InfiniteData<NotificationsPage>>(queryKey, current => updatePages(current, page => ({
        ...page,
        items: page.items.map(item => ({...item, isRead: true})),
      })));
      queryClient.setQueryData(notificationsKeys.unreadCount(), 0);
      return {previousPages, previousUnread};
    },
    onError: (_error, _variables, context) => {
      if (context?.previousPages) queryClient.setQueryData(queryKey, context.previousPages);
      if (context?.previousUnread !== undefined) queryClient.setQueryData(notificationsKeys.unreadCount(), context.previousUnread);
    },
  });

  const items = useMemo(
    () => deduplicateNotifications(query.data?.pages.flatMap(page => page.items) ?? []),
    [query.data?.pages],
  );

  const refresh = async () => {
    await Promise.all([query.refetch(), unreadQuery.refetch()]);
  };

  return {
    ...query,
    items,
    unreadCount: unreadQuery.data ?? items.filter(item => !item.isRead).length,
    unreadError: unreadQuery.error,
    markRead: markReadMutation.mutate,
    markAllRead: markAllReadMutation.mutate,
    markingAllRead: markAllReadMutation.isPending,
    mutationError: markReadMutation.error ?? markAllReadMutation.error,
    refresh,
  };
}
