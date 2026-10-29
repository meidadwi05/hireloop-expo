import {resolveNotificationDestination} from '../notifications.navigation';
import type {CandidateNotification} from '../notifications.types';

function notification(overrides: Partial<CandidateNotification> = {}): CandidateNotification {
  return {
    id: '1',
    type: 'system',
    level: 'info',
    title: 'Info',
    body: 'Body',
    isRead: false,
    createdAt: '2026-10-30T08:00:00+07:00',
    meta: {},
    ...overrides,
  };
}

describe('notification navigation resolver', () => {
  it('opens the dashboard evaluation modal for blacklist events', () => {
    expect(resolveNotificationDestination(notification({
      type: 'blacklist',
      meta: {action_url: '/dashboard'},
    }))).toEqual({pathname: '/(candidate)/(tabs)/home', params: {openEvaluation: '1'}});
  });

  it('normalizes web application URLs into native application detail routes', () => {
    expect(resolveNotificationDestination(notification({
      type: 'application_screening_passed',
      meta: {action_url: '/lamaran-saya/project-lowongan/42'},
    }))).toEqual({
      pathname: '/(candidate)/applications/[source]/[id]',
      params: {source: 'project-lowongan', id: '42'},
    });
  });

  it('uses typed metadata when action_url only targets the generic application page', () => {
    expect(resolveNotificationDestination(notification({
      type: 'application_status',
      meta: {
        action_url: '/lamaran-saya',
        job_reference_type: 'job-posting',
        job_reference_id: 7,
      },
    }))).toEqual({pathname: '/(candidate)/(tabs)/career'});
  });

  it('keeps informational notification actions inside the current page', () => {
    expect(resolveNotificationDestination(notification({
      type: 'no_fee_recruitment',
      meta: {action_url: '/Notifikasi'},
    }))).toBeNull();
  });
});
