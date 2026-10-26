import {render} from '@testing-library/react-native';
import React from 'react';
import {StyleSheet} from 'react-native';

import {NearestInterviewCard, ShortcutGrid} from '../DashboardHome';

jest.mock('@expo/vector-icons/Ionicons', () => () => null);

jest.mock('../../features/dashboard/hooks/use-dashboard-home', () => ({
  useDashboardHome: jest.fn(),
}));

describe('dashboard sections', () => {
  it('menampilkan card interview terdekat tanpa tab aktivitas lama', () => {
    const screen = render(
      <NearestInterviewCard
        interviews={[{
          id: 7,
          date: '2026-10-27',
          agenda: 'Interview tahap awal',
          time: '10:00',
          mode: 'online',
          location: null,
          meeting_link: 'https://example.test/meeting',
          role_taxonomy_name: 'Product Designer',
          candidate_name: 'Zaki',
          company_name: 'Tech Solutions Indonesia',
        }]}
      />,
    );

    expect(screen.getByText('Interview Terdekat')).toBeTruthy();
    expect(screen.getByText('Product Designer')).toBeTruthy();
    expect(screen.getByText(/Tech Solutions Indonesia/)).toBeTruthy();
    expect(screen.getByText('Online · Zoom')).toBeTruthy();
    expect(screen.getByText('Gabung Interview')).toBeTruthy();
    expect(screen.getByText('Detail')).toBeTruthy();
    expect(screen.queryByText('Progress Lamaran')).toBeNull();
    expect(screen.queryByText('Pengumuman')).toBeNull();
  });

  it('menampilkan empty state saat jadwal interview belum tersedia', () => {
    const screen = render(<NearestInterviewCard interviews={[]} />);

    expect(screen.getByText('Belum ada interview mendatang')).toBeTruthy();
  });

  it('menampilkan empat pintasan outline di dalam tile biru muda', () => {
    const screen = render(<ShortcutGrid />);

    expect(screen.getByText('Profil Saya')).toBeTruthy();
    expect(screen.getByText('Lowongan Kerja')).toBeTruthy();
    expect(screen.getByText('Lamaran Saya')).toBeTruthy();
    expect(screen.getByText('Performance')).toBeTruthy();

    const firstTile = screen.getByLabelText('Buka Profil Saya');
    expect(StyleSheet.flatten(firstTile.props.style).backgroundColor).toBe('#EAF3FF');
  });
});
