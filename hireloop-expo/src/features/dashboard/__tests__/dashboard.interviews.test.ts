import {
  interviewClock,
  interviewCompany,
  interviewDestination,
  interviewPosition,
  isSafeExternalUrl,
  selectUpcomingInterviews,
} from '../dashboard.interviews';
import type {DashboardInterview} from '../dashboard.types';

function interview(overrides: Partial<DashboardInterview> = {}): DashboardInterview {
  return {
    id: 1,
    date: '2026-11-10',
    agenda: 'Interview HR',
    time: '10:00:00',
    mode: 'online',
    location: null,
    meeting_link: 'https://meet.example.com/room',
    role_taxonomy_name: 'Product Designer',
    candidate_name: 'Kandidat',
    ...overrides,
  };
}

describe('dashboard interview helpers', () => {
  it('filters inactive and past schedules, removes duplicates, then sorts by date and time', () => {
    const result = selectUpcomingInterviews([
      interview({id: 4, date: '2026-11-11', start_time: '08:00:00', schedule_status: 'Terjadwal'}),
      interview({id: 2, start_time: '11:00:00', schedule_status: 'RESCHEDULE'}),
      interview({id: 1, start_time: '09:00:00', schedule_status: 'terjadwal'}),
      interview({id: 1, start_time: '09:00:00', schedule_status: 'terjadwal'}),
      interview({id: 3, schedule_status: 'Dibatalkan'}),
      interview({id: 5, date: '2026-11-01', schedule_status: 'terjadwal'}),
    ], new Date('2026-11-05T10:00:00'));

    expect(result.map(item => item.id)).toEqual([1, 2, 4]);
  });

  it('keeps legacy schedules without a status', () => {
    expect(selectUpcomingInterviews([interview()], new Date('2026-11-05T10:00:00'))).toHaveLength(1);
  });

  it('uses backend fallbacks for display values', () => {
    const value = interview({lowongan_name: 'UI Designer', project_name: 'PT HireLoop', start_time: '09:15:00', end_time: '10:45:00'});
    expect(interviewPosition(value)).toBe('UI Designer');
    expect(interviewCompany(value)).toBe('PT HireLoop');
    expect(interviewClock(value)).toBe('09:15 - 10:45 WIB');
    expect(interviewDestination(value)).toBe('https://meet.example.com/room');
  });

  it('uses maps for offline schedules', () => {
    const value = interview({mode: 'offline', address_maps_url: 'https://maps.example.com/office'});
    expect(interviewDestination(value)).toBe('https://maps.example.com/office');
  });

  it('only accepts http and https links', () => {
    expect(isSafeExternalUrl('https://meet.example.com/room')).toBe(true);
    expect(isSafeExternalUrl('http://maps.example.com/office')).toBe(true);
    expect(isSafeExternalUrl('javascript:alert(1)')).toBe(false);
    expect(isSafeExternalUrl('data:text/html,test')).toBe(false);
    expect(isSafeExternalUrl('not-a-url')).toBe(false);
  });
});
