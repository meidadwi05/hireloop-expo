import {fireEvent, render, waitFor} from '@testing-library/react-native';
import * as Linking from 'expo-linking';
import React from 'react';
import {processColor, StyleSheet} from 'react-native';

import type {CandidateApplication} from '../../features/applications/applications.types';
import {
  NearestInterviewCard,
  ProfileCompletionCard,
  RecentApplicationsCard,
  ShortcutGrid,
} from '../DashboardHome';

jest.mock('@expo/vector-icons/Ionicons', () => () => null);

jest.mock('expo-linking', () => ({
  canOpenURL: jest.fn(async () => true),
  openURL: jest.fn(async () => undefined),
}));

jest.mock('../../features/dashboard/hooks/use-dashboard-home', () => ({
  useDashboardHome: jest.fn(),
}));

describe('dashboard sections', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

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
    expect(screen.getByText(/Online/)).toBeTruthy();
    expect(screen.getByText('Gabung Interview')).toBeTruthy();
    expect(screen.getByText('Detail')).toBeTruthy();
    expect(screen.getByText('27')).toBeTruthy();
    expect(screen.getByText('OKT')).toBeTruthy();
    expect(screen.getByText('10:00 WIB')).toBeTruthy();
    expect(StyleSheet.flatten(screen.getByTestId('interview-date-block').props.style)).toMatchObject({
      borderRadius: 12,
      overflow: 'hidden',
      width: 82,
    });
    expect(StyleSheet.flatten(screen.getByTestId('interview-date-primary').props.style).backgroundColor).toBe('#0643AA');
    expect(StyleSheet.flatten(screen.getByTestId('interview-date-footer').props.style).backgroundColor).toBe('#D9E8FF');
    expect(screen.getByTestId('dashboard-interview-illustration').props.source).toBeTruthy();
    expect(screen.queryByText('Progress Lamaran')).toBeNull();
    expect(screen.queryByText('Pengumuman')).toBeNull();

    fireEvent.press(screen.getByText('Detail'));

    expect(screen.getByTestId('interview-detail-modal')).toBeTruthy();
    expect(screen.getByText('Jadwal Interview')).toBeTruthy();
  });

  it('membuka tautan interview langsung dari tombol gabung', async () => {
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

    fireEvent.press(screen.getByText('Gabung Interview'));

    await waitFor(() => {
      expect(Linking.canOpenURL).toHaveBeenCalledWith('https://example.test/meeting');
      expect(Linking.openURL).toHaveBeenCalledWith('https://example.test/meeting');
    });
  });

  it('menyembunyikan tombol gabung dan menampilkan detail lokasi untuk interview offline', () => {
    const screen = render(
      <NearestInterviewCard
        interviews={[{
          id: 8,
          date: '2026-12-08',
          agenda: 'sesi 1',
          time: '14:09',
          mode: 'offline',
          location: 'asd - asd asd st',
          meeting_link: null,
          address_maps_url: 'https://maps.google.com/?q=asd',
          role_taxonomy_name: 'Lowongan Operator Produksi',
          candidate_name: 'Zaki',
          company_name: 'HireLoop Recruitment',
          pic_name: 'Admin utama',
        }]}
      />,
    );

    expect(screen.queryByText('Gabung Interview')).toBeNull();
    expect(screen.getByText('Detail Lokasi')).toBeTruthy();

    fireEvent.press(screen.getByText('Detail Lokasi'));

    expect(screen.getByText('sesi 1')).toBeTruthy();
    expect(screen.getByText('Jadwal Anda')).toBeTruthy();
    expect(screen.getByText('Admin utama')).toBeTruthy();
    expect(screen.getByText('ALAMAT INTERVIEW')).toBeTruthy();
    expect(screen.getByText('asd - asd asd st')).toBeTruthy();
    expect(screen.getByText('Buka Maps')).toBeTruthy();
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

  it('membuka Profil Saya melalui route pintasan di luar tab Akun', () => {
    const onNavigate = jest.fn();
    const screen = render(<ShortcutGrid onNavigate={onNavigate} />);

    fireEvent.press(screen.getByLabelText('Buka Profil Saya'));

    expect(onNavigate).toHaveBeenCalledWith('/profile');
  });

  it('menampilkan card kelengkapan profil statis sesuai rancangan', () => {
    const onOpenProfile = jest.fn();
    const screen = render(<ProfileCompletionCard completion={75} onOpenProfile={onOpenProfile} />);

    expect(screen.getByText('Lengkapi Profilmu')).toBeTruthy();
    expect(screen.getByText('Lengkapi Profilmu').props.numberOfLines).toBe(1);
    expect(screen.getByText(/Lengkapi data dan pengalaman/).props.numberOfLines).toBe(2);
    expect(screen.getByText('75%')).toBeTruthy();
    expect(screen.getByText('Lengkapi sekarang')).toBeTruthy();
    expect(screen.getByTestId('profile-completion-illustration').props.source).toBeTruthy();
    expect(screen.getByTestId('profile-completion-gradient').props.colors).toEqual([
      processColor('#0145C0'),
      processColor('#00205A'),
    ]);
    fireEvent.press(screen.getByText('Lengkapi sekarang'));
    expect(onOpenProfile).toHaveBeenCalledTimes(1);
  });

  it('menjaga card kelengkapan profil tetap horizontal dan compact pada Android sempit', () => {
    const screen = render(<ProfileCompletionCard completion={90} containerWidth={320} />);

    expect(StyleSheet.flatten(screen.getByTestId('profile-completion-card').props.style)).toMatchObject({
      flexDirection: 'row',
      minHeight: 164,
      padding: 14,
    });
    expect(StyleSheet.flatten(screen.getByTestId('profile-completion-illustration').props.style)).toMatchObject({
      width: 96,
      height: 118,
    });
    expect(screen.getByText('Lengkapi Profilmu').props.numberOfLines).toBe(1);
    expect(screen.getByText(/Lengkapi data dan pengalaman/).props.numberOfLines).toBe(2);
  });

  it('menampilkan lamaran terbaru dinamis lengkap dengan perusahaan, tanggal, dan status backend', () => {
    const applications: CandidateApplication[] = [{
      applicationId: 12,
      source: 'job-posting',
      referenceId: 44,
      storageKind: 'applicant-data',
      title: 'UI/UX Designer',
      company: 'PT. Inovasi Digital',
      location: 'Jakarta',
      applicationStatus: 'in_progress',
      stageStatus: 'screening',
      currentStageIndex: 1,
      currentStageValue: 'screening',
      currentStageLabel: 'Screening',
      stages: [],
      state: 'in-progress',
      submittedAt: '2026-10-20T08:00:00Z',
      updatedAt: '2026-10-28T08:00:00Z',
      canceledAt: null,
      isTemporary: false,
      isTransferred: false,
      transferNote: null,
    }];
    const onOpen = jest.fn();
    const screen = render(<RecentApplicationsCard applications={applications} onOpen={onOpen} />);

    expect(screen.getByText('Lamaran Terbaru')).toBeTruthy();
    expect(screen.getByText('UI/UX Designer')).toBeTruthy();
    expect(screen.getByText('PT. Inovasi Digital')).toBeTruthy();
    expect(screen.getByText('Screening')).toBeTruthy();
    const companyIconStyle = StyleSheet.flatten(screen.getByTestId('recent-application-company-icon').props.style);
    expect(companyIconStyle.backgroundColor).toBe('#EDF5FF');
    expect(companyIconStyle.borderRadius).toBe(13);
    fireEvent.press(screen.getByLabelText('UI/UX Designer di PT. Inovasi Digital, Screening'));
    expect(onOpen).toHaveBeenCalledWith(applications[0]);
  });

  it('menampilkan empty state ketika kandidat belum pernah melamar', () => {
    const screen = render(<RecentApplicationsCard applications={[]} />);
    expect(screen.getByText('Belum ada lamaran')).toBeTruthy();
  });
});
