import {httpClient} from '../../../core/api/http-client';
import {notificationsApi} from '../api/notifications.api';

jest.mock('../../../core/api/http-client', () => ({
  httpClient: {get: jest.fn(), post: jest.fn()},
}));

describe('notificationsApi', () => {
  const get = jest.mocked(httpClient.get);
  const post = jest.mocked(httpClient.post);

  beforeEach(() => jest.clearAllMocks());

  it('requests and maps a paginated notification page', async () => {
    get.mockResolvedValueOnce({
      data: {
        data: [{id: 5, title: 'Status Lamaran', body: 'Lamaran diperbarui', is_read: false}],
        meta: {current_page: 1, last_page: 2, per_page: 20, total: 24},
      },
    });

    const page = await notificationsApi.list({page: 1, per_page: 20});

    expect(get).toHaveBeenCalledWith('/notifications', {params: {page: 1, per_page: 20}});
    expect(page.items[0].id).toBe('5');
    expect(page.lastPage).toBe(2);
  });

  it('uses the backend read endpoints', async () => {
    post.mockResolvedValue({data: {}});
    await notificationsApi.markRead('8');
    await notificationsApi.markAllRead();
    expect(post).toHaveBeenNthCalledWith(1, '/notifications/8/read');
    expect(post).toHaveBeenNthCalledWith(2, '/notifications/read-all');
  });

  it('requests the candidate unread count', async () => {
    get.mockResolvedValueOnce({data: {count: 7}});

    await expect(notificationsApi.unreadCount()).resolves.toBe(7);
    expect(get).toHaveBeenCalledWith('/notifications/unread-count');
  });

  it('keeps blacklist tier metadata from NotificationHistory', async () => {
    get.mockResolvedValueOnce({
      data: {
        data: [
          {id: 11, type: 'blacklist', level: 'warning', title: 'Anda Menerima Peringatan', body: 'Catatan evaluasi', is_read: false, meta: {tier: 'tier_1'}},
          {id: 12, type: 'blacklist', level: 'error', title: 'Akun Anda Masuk Daftar Blacklist', body: 'Akses melamar dibatasi', is_read: false, meta: {tier: 'tier_2'}},
        ],
        meta: {current_page: 1, last_page: 1, per_page: 20, total: 2},
      },
    });

    const page = await notificationsApi.list();

    expect(page.items.map(item => [item.level, item.meta.tier])).toEqual([
      ['warning', 'tier_1'],
      ['error', 'tier_2'],
    ]);
  });
});
