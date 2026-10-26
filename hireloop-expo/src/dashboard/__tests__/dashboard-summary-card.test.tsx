import {render} from '@testing-library/react-native';
import React from 'react';
import {StyleSheet} from 'react-native';

import {SummaryCard} from '../DashboardHome';

jest.mock('@expo/vector-icons/Ionicons', () => () => null);

jest.mock('../../features/dashboard/hooks/use-dashboard-home', () => ({
  useDashboardHome: jest.fn(),
}));

describe('dashboard summary card', () => {
  it('menampilkan empat card indikator mandiri dalam grid dua kolom', () => {
    const screen = render(
      <SummaryCard
        applications={[{status: 'applied'}, {status: 'interview'}]}
        interviews={[{id: 1}] as never[]}
        viewportWidth={390}
      />,
    );

    expect(screen.getByTestId('dashboard-summary-card')).toBeTruthy();
    expect(screen.getByLabelText('2 Total Lamaran')).toBeTruthy();
    expect(screen.getByLabelText('2 Dalam Seleksi')).toBeTruthy();
    expect(screen.getByLabelText('1 Jadwal Interview')).toBeTruthy();
    expect(screen.getByLabelText('0 Lowongan Disimpan')).toBeTruthy();
    expect(screen.queryByText('Lihat semua')).toBeNull();

    const gridStyle = StyleSheet.flatten(screen.getByTestId('dashboard-summary-card').props.style);
    expect(gridStyle.flexWrap).toBe('wrap');
  });

  it('memakai lingkaran ikon solid dan teks rata kiri', () => {
    const screen = render(
      <SummaryCard applications={[]} interviews={[]} viewportWidth={390} />,
    );

    expect(StyleSheet.flatten(screen.getByTestId('dashboard-summary-icon-0').props.style).backgroundColor).toBe('#00195E');
    expect(StyleSheet.flatten(screen.getByTestId('dashboard-summary-value-0').props.style).textAlign).toBeUndefined();
    expect(StyleSheet.flatten(screen.getByTestId('dashboard-summary-label-0').props.style).textAlign).toBeUndefined();
  });
});
