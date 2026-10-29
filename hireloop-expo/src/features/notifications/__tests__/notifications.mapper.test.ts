import {deduplicateNotifications, mapNotificationsPage} from '../notifications.mapper';

describe('notifications mapper', () => {
  it('maps a Laravel resource collection and keeps its pagination metadata', () => {
    const page = mapNotificationsPage({
      data: [{
        id: 18,
        type: 'blacklist',
        level: 'warning',
        title: 'Catatan Evaluasi',
        body: 'Periksa detail catatan Anda.',
        is_read: false,
        created_at: '2026-10-30T08:00:00+07:00',
        meta: {action_url: '/dashboard', tier: 'tier_1'},
      }],
      meta: {current_page: 2, last_page: 4, per_page: 20, total: 66},
    });

    expect(page).toMatchObject({currentPage: 2, lastPage: 4, perPage: 20, total: 66});
    expect(page.items[0]).toMatchObject({
      id: '18',
      type: 'blacklist',
      level: 'warning',
      isRead: false,
      meta: {action_url: '/dashboard', tier: 'tier_1'},
    });
  });

  it('accepts the legacy raw paginator shape and safe defaults for incomplete records', () => {
    const page = mapNotificationsPage({
      data: {
        data: [{id: '4', is_read: 1}],
        current_page: 1,
        last_page: 1,
        total: 1,
      },
    });

    expect(page.items[0]).toMatchObject({
      id: '4',
      title: 'Pemberitahuan HireLoop',
      type: 'system',
      isRead: true,
    });
  });

  it('deduplicates repeated records returned across page boundaries', () => {
    const page = mapNotificationsPage({data: [{id: 1}, {id: 2}, {id: 1}]});
    expect(deduplicateNotifications(page.items).map(item => item.id)).toEqual(['1', '2']);
  });
});
