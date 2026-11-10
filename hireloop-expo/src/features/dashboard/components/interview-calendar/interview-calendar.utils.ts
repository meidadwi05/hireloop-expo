import type {DashboardInterview} from '../../dashboard.types';

export const CALENDAR_MONTHS = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
] as const;

export const CALENDAR_WEEKDAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'] as const;

export type CalendarCell = {
  date: Date;
  key: string;
  day: number;
  inCurrentMonth: boolean;
};

export function localDateKey(value: Date | string) {
  const date = typeof value === 'string'
    ? new Date(`${value.slice(0, 10)}T00:00:00`)
    : value;
  if (Number.isNaN(date.getTime())) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function buildCalendarCells(year: number, month: number): CalendarCell[] {
  const firstDay = new Date(year, month, 1);
  const gridStart = new Date(year, month, 1 - firstDay.getDay());

  return Array.from({length: 42}, (_, index) => {
    const date = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + index);
    return {
      date,
      key: localDateKey(date)!,
      day: date.getDate(),
      inCurrentMonth: date.getMonth() === month,
    };
  });
}

export function interviewDateSet(interviews: DashboardInterview[]) {
  return new Set(interviews.map(item => localDateKey(item.date)).filter((value): value is string => Boolean(value)));
}

export function calendarYearOptions(interviews: DashboardInterview[], today = new Date()) {
  const years = interviews
    .map(item => localDateKey(item.date))
    .filter((value): value is string => Boolean(value))
    .map(value => Number(value.slice(0, 4)))
    .filter(Number.isFinite);
  const minimum = Math.min(today.getFullYear() - 2, ...years);
  const maximum = Math.max(today.getFullYear() + 2, ...years);
  return Array.from({length: maximum - minimum + 1}, (_, index) => minimum + index);
}

export function interviewsForDate(interviews: DashboardInterview[], selectedDate: string | null) {
  if (!selectedDate) return interviews;
  return interviews.filter(item => localDateKey(item.date) === selectedDate);
}
