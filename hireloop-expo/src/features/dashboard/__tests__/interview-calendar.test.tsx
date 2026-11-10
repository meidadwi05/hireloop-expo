import {fireEvent, render, waitFor} from '@testing-library/react-native';
import React from 'react';
import {StyleSheet} from 'react-native';

import {InterviewCalendarCard} from '../components/interview-calendar/InterviewCalendarCard';
import {
  buildCalendarCells,
  calendarYearOptions,
  interviewsForDate,
  localDateKey,
} from '../components/interview-calendar/interview-calendar.utils';
import type {DashboardInterview} from '../dashboard.types';

jest.mock('@expo/vector-icons/Ionicons', () => () => null);

const interviews: DashboardInterview[] = [
  {
    id: 1,
    date: '2026-12-08',
    agenda: 'Interview HR',
    time: '10:21',
    mode: 'online',
    location: null,
    meeting_link: 'https://zoom.us/j/1',
    role_taxonomy_name: 'Operator Produksi',
    candidate_name: 'Zaki',
  },
  {
    id: 2,
    date: '2026-12-23',
    agenda: 'Interview User',
    time: '10:00',
    mode: 'online',
    location: null,
    meeting_link: 'https://zoom.us/j/2',
    role_taxonomy_name: 'Operator Produksi',
    candidate_name: 'Zaki',
  },
];

describe('interview calendar', () => {
  it('membentuk grid 42 hari dan menggunakan tanggal lokal', () => {
    const cells = buildCalendarCells(2026, 11);

    expect(cells).toHaveLength(42);
    expect(cells.find(cell => cell.key === '2026-12-08')?.inCurrentMonth).toBe(true);
    expect(localDateKey('2026-12-08T23:59:00Z')).toBe('2026-12-08');
  });

  it('menampilkan semua interview tanpa tanggal aktif dan memfilter saat tanggal dipilih', () => {
    expect(interviewsForDate(interviews, null)).toHaveLength(2);
    expect(interviewsForDate(interviews, '2026-12-08').map(item => item.id)).toEqual([1]);
  });

  it('membentuk opsi tahun dari data dengan fallback tahun sekarang', () => {
    const years = calendarYearOptions(interviews, new Date('2026-11-10T00:00:00'));

    expect(years[0]).toBe(2024);
    expect(years.at(-1)).toBe(2028);
  });

  it('memilih tanggal, menghapus tanggal aktif, dan membuka dropdown inline', () => {
    const onSelectDate = jest.fn();
    const onChangeOpenDropdown = jest.fn();
    const baseProps = {
      compact: false,
      interviews,
      onChangeMonth: jest.fn(),
      onChangeOpenDropdown,
      onChangeYear: jest.fn(),
      onSelectDate,
      openDropdown: null as 'month' | 'year' | null,
      selectedDate: null as string | null,
      today: new Date('2026-11-10T00:00:00'),
      visibleMonth: 11,
      visibleYear: 2026,
    };
    const screen = render(<InterviewCalendarCard {...baseProps} />);

    expect(screen.queryByText('Kalender')).toBeNull();

    fireEvent.press(screen.getByTestId('calendar-day-2026-12-08'));
    expect(onSelectDate).toHaveBeenCalledWith('2026-12-08');

    screen.rerender(<InterviewCalendarCard {...baseProps} selectedDate="2026-12-08" />);
    fireEvent.press(screen.getByTestId('calendar-day-2026-12-08'));
    expect(onSelectDate).toHaveBeenLastCalledWith(null);

    fireEvent.press(screen.getByTestId('calendar-month-select'));
    expect(onChangeOpenDropdown).toHaveBeenCalledWith('month');

    screen.rerender(<InterviewCalendarCard {...baseProps} openDropdown="month" />);
    expect(screen.getByTestId('calendar-month-select-dropdown')).toBeTruthy();
    expect(screen.queryByText('Test')).toBeNull();
    expect(screen.queryByText('Medical')).toBeNull();
  });

  it('memindahkan bulan dan tahun ketika tanggal bulan berikutnya ditekan sambil menampilkan loading', async () => {
    const onChangeMonth = jest.fn();
    const onChangeYear = jest.fn();
    const onSelectDate = jest.fn();
    const screen = render(
      <InterviewCalendarCard
        compact={false}
        interviews={interviews}
        onChangeMonth={onChangeMonth}
        onChangeOpenDropdown={jest.fn()}
        onChangeYear={onChangeYear}
        onSelectDate={onSelectDate}
        openDropdown={null}
        selectedDate={null}
        today={new Date('2026-11-10T00:00:00')}
        visibleMonth={11}
        visibleYear={2026}
      />,
    );

    fireEvent.press(screen.getByTestId('calendar-day-2027-01-01'));

    expect(screen.getByTestId('calendar-transition-loading')).toBeTruthy();
    expect(StyleSheet.flatten(screen.getByTestId('calendar-date-grid').props.style).opacity).toBe(0.35);
    expect(onChangeMonth).not.toHaveBeenCalled();

    await waitFor(() => {
      expect(onChangeMonth).toHaveBeenCalledWith(0);
      expect(onChangeYear).toHaveBeenCalledWith(2027);
      expect(onSelectDate).toHaveBeenCalledWith('2027-01-01');
    }, {timeout: 1000});

    await waitFor(() => expect(screen.queryByTestId('calendar-transition-loading')).toBeNull(), {timeout: 1000});
  });

  it('membersihkan timer perpindahan ketika kalender ditutup', async () => {
    const onChangeMonth = jest.fn();
    const screen = render(
      <InterviewCalendarCard
        compact
        interviews={interviews}
        onChangeMonth={onChangeMonth}
        onChangeOpenDropdown={jest.fn()}
        onChangeYear={jest.fn()}
        onSelectDate={jest.fn()}
        openDropdown={null}
        selectedDate={null}
        today={new Date('2026-11-10T00:00:00')}
        visibleMonth={11}
        visibleYear={2026}
      />,
    );

    fireEvent.press(screen.getByTestId('calendar-day-2027-01-01'));
    screen.unmount();
    await new Promise(resolve => setTimeout(resolve, 350));

    expect(onChangeMonth).not.toHaveBeenCalled();
  });
});
