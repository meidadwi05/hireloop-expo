import {render} from '@testing-library/react-native';
import React from 'react';
import {StyleSheet} from 'react-native';

import {JobCard} from '../DashboardHome';

jest.mock('@expo/vector-icons/Ionicons', () => () => null);

jest.mock('../../features/dashboard/hooks/use-dashboard-home', () => ({
  useDashboardHome: jest.fn(),
}));

describe('dashboard job card', () => {
  it('mengikuti struktur visual lowongan terbaru tanpa mengubah tombol utama', () => {
    const screen = render(
      <JobCard
        job={{
          id: 1,
          key: 'job-posting:1',
          source: 'job-posting',
          title: 'Lowongan Operator Produksi',
          company: 'PT Dummy Project Indonesia',
          location: 'Karawang, Jawa Barat',
          contractType: 'Kontrak',
          workMode: 'On Site',
          salaryLabel: 'Rp 6.000.000 â€“ Rp 7.000.000',
          active: true,
          applicantsCount: 1,
          closingDate: '2026-11-30',
          publishedAt: null,
          updatedAt: null,
          closingLabel: 'Berakhir 30 November 2026',
          workType: 'On Site',
          salary: 'Rp 6.000.000 – Rp 7.000.000',
          urgent: true,
          skills: ['Analisis metrik produk', 'Dukungan produksi', 'Analisis proses bisnis', 'Adaptability', 'Teamwork', 'Quality Control'],
          publishedLabel: 'Tayang 5 hari yang lalu',
          updatedLabel: 'Diperbarui 5 hari yang lalu',
        }}
        width={360}
      />,
    );

    expect(screen.getByText('Lowongan Operator Produksi')).toBeTruthy();
    expect(screen.getByText('PT Dummy Project Indonesia')).toBeTruthy();
    expect(screen.getByText('Aktif')).toBeTruthy();
    expect(screen.getByText('Dibutuhkan Segera')).toBeTruthy();
    expect(screen.getByText('Karawang, Jawa Barat')).toBeTruthy();
    expect(screen.getByText('Kontrak')).toBeTruthy();
    expect(screen.getByText('On Site')).toBeTruthy();
    expect(screen.getByText('1')).toBeTruthy();
    expect(screen.getByText('Total Pelamar')).toBeTruthy();
    expect(screen.getByText('Berakhir 30 November 2026')).toBeTruthy();
    expect(screen.getByText('Tayang 5 hari yang lalu')).toBeTruthy();
    expect(screen.getByText('Diperbarui 5 hari yang lalu')).toBeTruthy();
    expect(screen.getByText('+2')).toBeTruthy();
    expect(screen.getByText('Lamar sekarang')).toBeTruthy();
    expect(screen.getByText('Lihat Detail  ›')).toBeTruthy();

    const cardStyle = StyleSheet.flatten(screen.getByTestId('dashboard-job-card').props.style);
    const buttonStyle = StyleSheet.flatten(screen.getByTestId('dashboard-job-apply-button').props.style);

    expect(cardStyle.borderColor).toBe('#EDF1F7');
    expect(buttonStyle.backgroundColor).toBe('#0345AE');
  });
});
