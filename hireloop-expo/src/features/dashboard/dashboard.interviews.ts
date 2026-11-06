import type {DashboardInterview} from './dashboard.types';

const ACTIVE_SCHEDULE_STATUSES = new Set(['terjadwal', 'scheduled', 'reschedule', 'rescheduled']);

function normalizedTime(value: string | null | undefined) {
  if (!value) return '23:59:59';
  const match = value.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?/);
  if (!match) return '23:59:59';
  return `${match[1].padStart(2, '0')}:${match[2]}:${match[3] ?? '00'}`;
}

export function interviewTimestamp(interview: DashboardInterview) {
  const value = Date.parse(`${interview.date.slice(0, 10)}T${normalizedTime(interview.start_time ?? interview.time)}`);
  return Number.isNaN(value) ? Number.MAX_SAFE_INTEGER : value;
}

export function selectUpcomingInterviews(interviews: DashboardInterview[], now = new Date()) {
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const unique = new Map<string, DashboardInterview>();

  interviews.forEach(interview => unique.set(String(interview.id), interview));

  return [...unique.values()]
    .filter(interview => {
      const status = interview.schedule_status?.trim().toLowerCase();
      const active = !status || ACTIVE_SCHEDULE_STATUSES.has(status);
      const date = Date.parse(`${interview.date.slice(0, 10)}T00:00:00`);
      return active && !Number.isNaN(date) && date >= startOfToday;
    })
    .sort((left, right) => {
      const timestampDifference = interviewTimestamp(left) - interviewTimestamp(right);
      return timestampDifference || String(left.id).localeCompare(String(right.id), 'id-ID', {numeric: true});
    });
}

export function interviewCompany(interview: DashboardInterview) {
  return interview.company_name || interview.project_name || 'HireLoop Recruitment';
}

export function interviewPosition(interview: DashboardInterview) {
  return interview.lowongan_name || interview.role_taxonomy_name || interview.agenda || 'Interview Kandidat';
}

export function interviewClock(interview: DashboardInterview) {
  const start = interview.start_time ?? interview.time;
  const end = interview.end_time;
  if (!start) return 'Waktu menyusul';
  const normalizedStart = start.slice(0, 5);
  return end ? `${normalizedStart} - ${end.slice(0, 5)} WIB` : `${normalizedStart} WIB`;
}

export function interviewDestination(interview: DashboardInterview) {
  if (interview.mode === 'online') return interview.meeting_link;
  return interview.address_maps_url || interview.address_link;
}

export function isSafeExternalUrl(value: string | null | undefined) {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}
