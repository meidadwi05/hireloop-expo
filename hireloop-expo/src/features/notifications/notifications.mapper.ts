import type {
  CandidateNotification,
  CandidateNotificationMeta,
  NotificationLevel,
  NotificationsPage,
} from './notifications.types';

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function asText(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function asIdentifier(value: unknown, fallback: string): string {
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return asText(value, fallback);
}

function asPositiveInteger(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function asNonNegativeInteger(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback;
}

function normalizeLevel(value: unknown): NotificationLevel {
  return ['success', 'info', 'warning', 'error'].includes(String(value).toLowerCase())
    ? String(value).toLowerCase() as NotificationLevel
    : 'info';
}

function normalizeDate(value: unknown): string {
  const text = asText(value);
  if (!text) return new Date(0).toISOString();
  const normalized = text.includes('T') ? text : text.replace(' ', 'T');
  return Number.isNaN(Date.parse(normalized)) ? new Date(0).toISOString() : normalized;
}

export function mapCandidateNotification(value: unknown, index = 0): CandidateNotification {
  const raw = asRecord(value);
  const meta = asRecord(raw.meta) as CandidateNotificationMeta;

  return {
    id: asIdentifier(raw.id, `notification-${index}`),
    type: asText(raw.type, 'system').toLowerCase(),
    level: normalizeLevel(raw.level),
    title: asText(raw.title, 'Pemberitahuan HireLoop'),
    body: asText(raw.body, 'Buka HireLoop untuk melihat informasi terbaru.'),
    isRead: raw.is_read === true || raw.is_read === 1 || raw.is_read === '1',
    createdAt: normalizeDate(raw.created_at),
    meta,
  };
}

export function mapNotificationsPage(payload: unknown): NotificationsPage {
  const root = asRecord(payload);
  const nestedData = asRecord(root.data);
  const collection = Array.isArray(root.data)
    ? root.data
    : Array.isArray(nestedData.data)
      ? nestedData.data
      : [];
  const meta = asRecord(root.meta);
  const pagination = Object.keys(meta).length ? meta : nestedData;
  const currentPage = asPositiveInteger(pagination.current_page, 1);
  const lastPage = Math.max(currentPage, asPositiveInteger(pagination.last_page, currentPage));
  const perPage = asPositiveInteger(pagination.per_page, Math.max(collection.length, 20));

  return {
    items: collection.map(mapCandidateNotification),
    currentPage,
    lastPage,
    perPage,
    total: asNonNegativeInteger(pagination.total, collection.length),
  };
}

export function deduplicateNotifications(items: CandidateNotification[]): CandidateNotification[] {
  return Array.from(new Map(items.map(item => [item.id, item])).values());
}
