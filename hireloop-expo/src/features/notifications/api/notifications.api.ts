import {httpClient} from '../../../core/api/http-client';
import {mapNotificationsPage} from '../notifications.mapper';
import type {NotificationsPage, NotificationsQuery} from '../notifications.types';

export const notificationsApi = {
  async list(query: NotificationsQuery = {}): Promise<NotificationsPage> {
    const response = await httpClient.get('/notifications', {params: query});
    return mapNotificationsPage(response.data);
  },

  async unreadCount(): Promise<number> {
    const response = await httpClient.get<{count?: number}>('/notifications/unread-count');
    return Number(response.data.count) || 0;
  },

  async markRead(notificationId: number | string): Promise<void> {
    await httpClient.post(`/notifications/${notificationId}/read`);
  },

  async markAllRead(): Promise<void> {
    await httpClient.post('/notifications/read-all');
  },
};
