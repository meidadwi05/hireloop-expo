import {render} from '@testing-library/react-native';
import React from 'react';
import {processColor, StyleSheet} from 'react-native';

import {
  NearestInterviewCard,
  ProfileCompletionCard,
  RecentApplicationsCard,
  ShortcutGrid,
} from '../DashboardHome';

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
    expect(StyleSheet.flatten(firstTile.props.style).shadowOpacity).toBe(0.06);
    expect(StyleSheet.flatten(firstTile.props.style).elevation).toBe(2);
  });

  it('menampilkan card kelengkapan profil statis sesuai rancangan', () => {
    const screen = render(<ProfileCompletionCard completion={75} />);

    expect(screen.getByText('Lengkapi Profilmu')).toBeTruthy();
    expect(screen.getByText('75%')).toBeTruthy();
    expect(screen.getByText('Lengkapi sekarang')).toBeTruthy();
    expect(screen.getByTestId('profile-completion-illustration').props.source).toBeTruthy();
    expect(screen.getByTestId('profile-completion-gradient').props.colors).toEqual([
      processColor('#0145C0'),
      processColor('#00205A'),
    ]);
  });

  it('menampilkan dua lamaran terbaru statis setelah integrasi backend ditahan', () => {
    const screen = render(<RecentApplicationsCard />);

    expect(screen.getByText('Lamaran Terbaru')).toBeTruthy();
    expect(screen.getByText('UI/UX Designer')).toBeTruthy();
    expect(screen.getByText('PT. Inovasi Digital')).toBeTruthy();
    expect(screen.getByText('Screening')).toBeTruthy();
    expect(screen.getByText('Admin Produksi')).toBeTruthy();
    expect(screen.getByText('PT. Mitra Industri')).toBeTruthy();
    expect(screen.getByText('Lamaran Terkirim')).toBeTruthy();
  });
});
