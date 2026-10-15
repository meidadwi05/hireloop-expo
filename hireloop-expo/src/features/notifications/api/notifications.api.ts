import {httpClient} from '../../../core/api/http-client';

export const notificationsApi = {
  async list(): Promise<unknown> {
    const response = await httpClient.get('/notifications');
    return response.data;
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
