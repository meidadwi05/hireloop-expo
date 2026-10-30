import type {CandidateNotification} from '../notifications.types';
import {formatNotificationTime, groupNotifications, notificationPresentation} from '../notifications.ui';

function notification(id: string, createdAt: string, type = 'system'): CandidateNotification {
  return {id, createdAt, type, level: 'info', title: 'Info', body: 'Body', isRead: false, meta: {}};
}

describe('notification UI helpers', () => {
  const now = new Date('2026-10-30T12:00:00+07:00');

  it('groups notifications using local calendar days', () => {
    const result = groupNotifications([
      notification('1', '2026-10-30T08:00:00+07:00'),
      notification('2', '2026-10-29T22:00:00+07:00'),
      notification('3', '2026-10-25T10:00:00+07:00'),
    ], now);

    expect(result.map(section => section.title)).toEqual(['Hari ini', 'Kemarin', '25 Oktober 2026']);
  });

  it('formats recent time labels in Indonesian', () => {
    expect(formatNotificationTime('2026-10-30T11:45:00+07:00', now)).toBe('15 menit lalu');
    expect(formatNotificationTime('2026-10-29T11:45:00+07:00', now)).toBe('Kemarin');
  });

  it('uses a warning treatment for blacklist notifications', () => {
    expect(notificationPresentation(notification('1', now.toISOString(), 'blacklist'))).toMatchObject({
      icon: 'warning-outline',
      color: '#B54708',
      label: 'Peringatan',
    });
  });

  it('distinguishes a tier 2 blacklist from a tier 1 warning', () => {
    expect(notificationPresentation({
      ...notification('1', now.toISOString(), 'blacklist'),
      meta: {tier: 'tier_2'},
    })).toMatchObject({
      icon: 'shield-outline',
      color: '#C6283D',
      label: 'Blacklist',
    });
  });
});
