import {render} from '@testing-library/react-native';
import React from 'react';
import {StyleSheet} from 'react-native';

import type {CandidateApplication} from '../../features/applications/applications.types';
import {SummaryCard} from '../DashboardHome';

jest.mock('@expo/vector-icons/Ionicons', () => () => null);

jest.mock('../../features/dashboard/hooks/use-dashboard-home', () => ({
  useDashboardHome: jest.fn(),
}));

describe('dashboard summary card', () => {
  const application = (id: number, state: CandidateApplication['state']): CandidateApplication => ({
    applicationId: id,
    source: 'job-posting',
    referenceId: id,
    storageKind: 'applicant-data',
    title: `Pekerjaan ${id}`,
    company: 'HireLoop',
    location: 'Jakarta',
    applicationStatus: state,
    stageStatus: state,
    currentStageIndex: 0,
    currentStageValue: state,
    currentStageLabel: state,
    stages: [],
    state,
    submittedAt: '2026-10-28T08:00:00Z',
    updatedAt: '2026-10-28T08:00:00Z',
    canceledAt: null,
    isTemporary: false,
    isTransferred: false,
    transferNote: null,
  });

  const props = {
    applications: [application(1, 'in-progress'), application(2, 'applied')],
    interviewsCount: 2,
    savedCount: 7,
    viewportWidth: 390,
  };

  it('menampilkan empat card indikator mandiri dalam grid dua kolom', () => {
    const screen = render(
      <SummaryCard {...props} />,
    );

    expect(screen.getByTestId('dashboard-summary-card')).toBeTruthy();
    expect(screen.getByLabelText('2 Total Lamaran')).toBeTruthy();
    expect(screen.getByLabelText('1 Dalam Seleksi')).toBeTruthy();
    expect(screen.getByLabelText('2 Interview Mendatang')).toBeTruthy();
    expect(screen.getByLabelText('7 Lowongan Disimpan')).toBeTruthy();
    expect(screen.queryByText('Lihat semua')).toBeNull();

    const gridStyle = StyleSheet.flatten(screen.getByTestId('dashboard-summary-card').props.style);
    expect(gridStyle.flexWrap).toBe('wrap');
    expect(gridStyle.marginTop).toBe(-48);
    expect(gridStyle.zIndex).toBe(3);
  });

  it('memakai ikon solid rounded-square dengan shadow lembut dan teks rata kiri', () => {
    const screen = render(
      <SummaryCard {...props} />,
    );

    const iconStyle = StyleSheet.flatten(screen.getByTestId('dashboard-summary-icon-0').props.style);
    const shadowStyle = StyleSheet.flatten(screen.getByTestId('dashboard-summary-icon-shadow-0').props.style);
    expect(iconStyle.backgroundColor).toBe('#00195E');
    expect(iconStyle.borderRadius).toBe(21);
    expect(shadowStyle.width).toBe(50);
    expect(shadowStyle.height).toBe(50);
    expect(shadowStyle.shadowOpacity).toBe(0.22);
    expect(shadowStyle.shadowRadius).toBe(5);
    expect(StyleSheet.flatten(screen.getByTestId('dashboard-summary-value-0').props.style).textAlign).toBeUndefined();
    expect(StyleSheet.flatten(screen.getByTestId('dashboard-summary-label-0').props.style).textAlign).toBeUndefined();
  });

  it('menjadikan seluruh indikator sebagai statistik non-interaktif', () => {
    const screen = render(<SummaryCard {...props} />);

    expect(screen.queryAllByRole('button')).toHaveLength(0);
    expect(screen.getByTestId('dashboard-summary-item-0').props.onPress).toBeUndefined();
    expect(screen.getByTestId('dashboard-summary-item-1').props.onPress).toBeUndefined();
    expect(screen.getByTestId('dashboard-summary-item-2').props.onPress).toBeUndefined();
    expect(screen.getByTestId('dashboard-summary-item-3').props.onPress).toBeUndefined();
  });
});
