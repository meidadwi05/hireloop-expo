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
      <SummaryCard viewportWidth={390} />,
    );

    expect(screen.getByTestId('dashboard-summary-card')).toBeTruthy();
    expect(screen.getByLabelText('12 Total Lamaran')).toBeTruthy();
    expect(screen.getByLabelText('4 Dalam Seleksi')).toBeTruthy();
    expect(screen.getByLabelText('2 Jadwal Interview')).toBeTruthy();
    expect(screen.getByLabelText('7 Lowongan Disimpan')).toBeTruthy();
    expect(screen.queryByText('Lihat semua')).toBeNull();

    const gridStyle = StyleSheet.flatten(screen.getByTestId('dashboard-summary-card').props.style);
    expect(gridStyle.flexWrap).toBe('wrap');
    expect(gridStyle.marginTop).toBe(-48);
    expect(gridStyle.zIndex).toBe(3);
  });

  it('memakai ikon solid rounded-square dengan shadow lembut dan teks rata kiri', () => {
    const screen = render(
      <SummaryCard viewportWidth={390} />,
    );

    const iconStyle = StyleSheet.flatten(screen.getByTestId('dashboard-summary-icon-0').props.style);
    expect(iconStyle.backgroundColor).toBe('#00195E');
    expect(iconStyle.borderRadius).toBe(11);
    expect(iconStyle.width).toBe(47);
    expect(iconStyle.height).toBe(47);
    expect(iconStyle.shadowOpacity).toBe(0.22);
    expect(iconStyle.shadowRadius).toBe(5);
    expect(StyleSheet.flatten(screen.getByTestId('dashboard-summary-value-0').props.style).textAlign).toBeUndefined();
    expect(StyleSheet.flatten(screen.getByTestId('dashboard-summary-label-0').props.style).textAlign).toBeUndefined();
  });
});
