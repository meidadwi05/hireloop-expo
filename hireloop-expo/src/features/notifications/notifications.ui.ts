import type Ionicons from '@expo/vector-icons/Ionicons';
import type {ComponentProps} from 'react';

import type {CandidateNotification} from './notifications.types';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

export const NOTIFICATION_FONTS = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
} as const;

export type NotificationPresentation = {
  background: string;
  color: string;
  icon: IoniconName;
};

export type NotificationSection = {
  data: CandidateNotification[];
  title: string;
};

export function notificationPresentation(notification: CandidateNotification): NotificationPresentation {
  const type = notification.type;
  if (type === 'blacklist') return {icon: 'warning-outline', color: '#B54708', background: '#FFF0D5'};
  if (type === 'new_job') return {icon: 'briefcase-outline', color: '#0B63E5', background: '#E8F1FF'};
  if (type === 'welcome' || type === 'no_fee_recruitment') return {icon: 'megaphone-outline', color: '#7A42D8', background: '#F1EAFE'};
  if (type.includes('interview') || type === 'interview') return {icon: 'calendar-outline', color: '#7A42D8', background: '#F1EAFE'};
  if (type.includes('offering') || type.includes('hired')) return {icon: 'ribbon-outline', color: '#07845E', background: '#E3F8F0'};
  if (type.startsWith('application_') || type.includes('selection') || type.includes('recommendation') || type.includes('transfer')) {
    return {icon: 'document-text-outline', color: '#0B63E5', background: '#E8F1FF'};
  }
  if (notification.level === 'success') return {icon: 'checkmark-circle-outline', color: '#07845E', background: '#E3F8F0'};
  if (notification.level === 'warning') return {icon: 'warning-outline', color: '#B54708', background: '#FFF0D5'};
  if (notification.level === 'error') return {icon: 'close-circle-outline', color: '#C4324E', background: '#FFE8ED'};
  return {icon: 'notifications-outline', color: '#0B63E5', background: '#E8F1FF'};
}

function parsedDate(value: string): Date {
  const normalized = value.includes('T') ? value : value.replace(' ', 'T');
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? new Date(0) : date;
}

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

export function formatNotificationTime(value: string, now = new Date()): string {
  const date = parsedDate(value);
  const difference = Math.max(0, now.getTime() - date.getTime());
  const minutes = Math.floor(difference / 60_000);
  if (minutes < 1) return 'Baru saja';
  if (minutes < 60) return `${minutes} menit lalu`;
  if (startOfDay(date) === startOfDay(now)) {
    return new Intl.DateTimeFormat('id-ID', {hour: '2-digit', minute: '2-digit'}).format(date);
  }
  const days = Math.floor((startOfDay(now) - startOfDay(date)) / 86_400_000);
  if (days === 1) return 'Kemarin';
  return new Intl.DateTimeFormat('id-ID', {day: 'numeric', month: 'short'}).format(date);
}

export function groupNotifications(items: CandidateNotification[], now = new Date()): NotificationSection[] {
  const today = startOfDay(now);
  const grouped = new Map<string, CandidateNotification[]>();

  items.forEach(item => {
    const date = parsedDate(item.createdAt);
    const difference = Math.floor((today - startOfDay(date)) / 86_400_000);
    const label = difference === 0
      ? 'Hari ini'
      : difference === 1
        ? 'Kemarin'
        : new Intl.DateTimeFormat('id-ID', {day: 'numeric', month: 'long', year: 'numeric'}).format(date);
    grouped.set(label, [...(grouped.get(label) ?? []), item]);
  });

  return Array.from(grouped, ([title, data]) => ({title, data}));
}
