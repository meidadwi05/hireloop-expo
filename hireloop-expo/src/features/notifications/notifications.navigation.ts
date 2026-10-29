import type {CandidateNotification, CandidateNotificationMeta} from './notifications.types';

export type NotificationDestination = {
  params?: Record<string, string>;
  pathname: string;
};

function asId(value: unknown): string | null {
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  if (typeof value === 'string' && value.trim()) return value.trim();
  return null;
}

function detailDestination(source: 'job-posting' | 'project-lowongan', id: string, application = false): NotificationDestination {
  return {
    pathname: application
      ? '/(candidate)/applications/[source]/[id]'
      : '/(candidate)/jobs/[source]/[id]',
    params: {source, id},
  };
}

function destinationFromActionUrl(actionUrl: unknown, notification: CandidateNotification): NotificationDestination | null {
  if (typeof actionUrl !== 'string' || !actionUrl.trim()) return null;
  const path = actionUrl.trim().split('?')[0].replace(/\/$/, '').toLowerCase();

  if (path === '/dashboard' || path === '/dashboard-user') {
    return {
      pathname: '/(candidate)/(tabs)/home',
      params: notification.type === 'blacklist' ? {openEvaluation: '1'} : undefined,
    };
  }
  if (path === '/profile') return {pathname: '/profile'};
  if (path === '/notifikasi' || path === '/notifications') return null;
  if (path === '/lamaran-saya') return {pathname: '/(candidate)/(tabs)/career'};
  if (path === '/lowongan' || path === '/job-listing-all') return {pathname: '/(candidate)/(tabs)/jobs'};

  const applicationMatch = path.match(/^\/lamaran-saya\/(job-posting|project-lowongan)\/(\d+)$/);
  if (applicationMatch) {
    return detailDestination(applicationMatch[1] as 'job-posting' | 'project-lowongan', applicationMatch[2], true);
  }

  const jobMatch = path.match(/^\/(?:job-listing-all\/)?(job-posting|project-lowongan)\/(\d+)$/);
  if (jobMatch) {
    return detailDestination(jobMatch[1] as 'job-posting' | 'project-lowongan', jobMatch[2]);
  }

  return null;
}

function referenceFromMeta(meta: CandidateNotificationMeta): {source: 'job-posting' | 'project-lowongan'; id: string} | null {
  const explicitSource = meta.job_reference_type === 'project-lowongan'
    ? 'project-lowongan'
    : meta.job_reference_type === 'job-posting'
      ? 'job-posting'
      : null;
  const explicitId = asId(meta.job_reference_id);
  if (explicitSource && explicitId) return {source: explicitSource, id: explicitId};

  const projectId = asId(meta.lowongan_id);
  if (projectId) return {source: 'project-lowongan' as const, id: projectId};
  const postingId = asId(meta.job_posting_id);
  if (postingId) return {source: 'job-posting' as const, id: postingId};
  return null;
}

export function resolveNotificationDestination(notification: CandidateNotification): NotificationDestination | null {
  const actionDestination = destinationFromActionUrl(notification.meta.action_url, notification);
  if (actionDestination) return actionDestination;

  if (notification.type === 'blacklist') {
    return {pathname: '/(candidate)/(tabs)/home', params: {openEvaluation: '1'}};
  }
  if (notification.type === 'welcome') return {pathname: '/profile'};
  if (notification.type === 'no_fee_recruitment') return null;

  const reference = referenceFromMeta(notification.meta);
  if (reference) {
    const application = notification.type.startsWith('application_')
      || notification.type === 'interview'
      || notification.type.includes('selection')
      || notification.type.includes('transfer')
      || notification.type.includes('recommendation');
    return detailDestination(reference.source, reference.id, application);
  }

  if (
    notification.type.startsWith('application_')
    || notification.type === 'interview'
    || notification.type.includes('selection')
    || notification.type.includes('transfer')
    || notification.type.includes('recommendation')
    || ['hired', 'rejected'].includes(notification.type)
  ) {
    return {pathname: '/(candidate)/(tabs)/career'};
  }
  if (notification.type === 'new_job') return {pathname: '/(candidate)/(tabs)/jobs'};
  return null;
}
