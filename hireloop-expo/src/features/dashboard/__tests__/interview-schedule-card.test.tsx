import {fireEvent, render} from '@testing-library/react-native';
import React from 'react';

import {InterviewScheduleCard} from '../components/InterviewScheduleCard';
import type {DashboardInterview} from '../dashboard.types';

jest.mock('@expo/vector-icons/Ionicons', () => () => null);
jest.mock('expo-linear-gradient', () => {
  const ReactModule = jest.requireActual<typeof import('react')>('react');
  const {View: NativeView} = jest.requireActual<typeof import('react-native')>('react-native');
  return {LinearGradient: (props: object) => ReactModule.createElement(NativeView, props)};
});

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
  it('menampilkan tombol gabung dan detail untuk interview online', () => {
    const onJoin = jest.fn();
    const onDetail = jest.fn();
    const screen = render(<InterviewScheduleCard compact={false} interview={interview()} onDetail={onDetail} onJoin={onJoin} />);

    fireEvent.press(screen.getByText('Gabung Interview'));
    fireEvent.press(screen.getByText('Detail'));

    expect(screen.getByTestId('interview-card-chevron')).toBeTruthy();
    expect(screen.getByTestId('interview-join-gradient').props.colors).toEqual(['#0145C0', '#00205A']);
    expect(onJoin).toHaveBeenCalledTimes(1);
    expect(onDetail).toHaveBeenCalledTimes(1);
  });

  it('menyembunyikan tombol gabung dan menampilkan detail lokasi untuk interview offline', () => {
    const onJoin = jest.fn();
    const onDetail = jest.fn();
    const screen = render(
      <InterviewScheduleCard
        compact
        interview={interview({mode: 'offline', meeting_link: null, location: 'Jakarta Selatan'})}
        onDetail={onDetail}
        onJoin={onJoin}
      />,
    );

    expect(screen.queryByText('Gabung Interview')).toBeNull();
    expect(screen.getByText('Detail Lokasi')).toBeTruthy();
    fireEvent.press(screen.getByText('Detail Lokasi'));
    expect(onDetail).toHaveBeenCalledTimes(1);
    expect(onJoin).not.toHaveBeenCalled();
  });

  it('tidak menampilkan tombol gabung ketika link online tidak aman', () => {
    const screen = render(
      <InterviewScheduleCard
        compact={false}
        interview={interview({meeting_link: 'javascript:alert(1)'})}
        onDetail={jest.fn()}
        onJoin={jest.fn()}
      />,
    );

    expect(screen.queryByText('Gabung Interview')).toBeNull();
    expect(screen.getByText('Detail')).toBeTruthy();
  });
});
