export const notificationsKeys = {
  all: ['notifications'] as const,
  list: () => [...notificationsKeys.all, 'list'] as const,
  infinite: (perPage = 20) => [...notificationsKeys.list(), 'infinite', {perPage}] as const,
  unreadCount: () => [...notificationsKeys.all, 'unread-count'] as const,
};
