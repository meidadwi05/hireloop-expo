import {fireEvent, render} from '@testing-library/react-native';
import React from 'react';
import {StyleSheet} from 'react-native';

import {InterviewScheduleCard} from '../components/InterviewScheduleCard';
import type {DashboardInterview} from '../dashboard.types';

jest.mock('@expo/vector-icons/Ionicons', () => () => null);

function interview(overrides: Partial<DashboardInterview> = {}): DashboardInterview {
  return {
    id: 1,
    date: '2026-12-08',
    agenda: 'Interview HR & User',
    time: '10:21',
    mode: 'online',
    location: null,
    meeting_link: 'https://zoom.us/j/1',
    role_taxonomy_name: 'Lowongan Operator Produksi',
    candidate_name: 'Zaki',
    company_name: 'Dummy Project',
    ...overrides,
  };
}

describe('InterviewScheduleCard', () => {
  it('menampilkan hanya tombol detail untuk interview online', () => {
    const onDetail = jest.fn();
    const screen = render(<InterviewScheduleCard compact={false} interview={interview()} onDetail={onDetail} />);

    fireEvent.press(screen.getByText('Detail'));

    expect(screen.getByTestId('interview-card-chevron')).toBeTruthy();
    expect(screen.queryByText('Gabung Interview')).toBeNull();
    expect(StyleSheet.flatten(screen.getByTestId('interview-card-actions').props.style).justifyContent).toBe('flex-end');
    expect(onDetail).toHaveBeenCalledTimes(1);
  });

  it('menyembunyikan tombol gabung dan menampilkan detail lokasi untuk interview offline', () => {
    const onDetail = jest.fn();
    const screen = render(
      <InterviewScheduleCard
        compact
        interview={interview({mode: 'offline', meeting_link: null, location: 'Jakarta Selatan'})}
        onDetail={onDetail}
      />,
    );

    expect(screen.queryByText('Gabung Interview')).toBeNull();
    expect(screen.getByText('Detail Lokasi')).toBeTruthy();
    fireEvent.press(screen.getByText('Detail Lokasi'));
    expect(onDetail).toHaveBeenCalledTimes(1);
  });

  it('tidak menampilkan tombol gabung ketika link online tidak aman', () => {
    const screen = render(
      <InterviewScheduleCard
        compact={false}
        interview={interview({meeting_link: 'javascript:alert(1)'})}
        onDetail={jest.fn()}
      />,
    );

    expect(screen.queryByText('Gabung Interview')).toBeNull();
    expect(screen.getByText('Detail')).toBeTruthy();
  });
});
