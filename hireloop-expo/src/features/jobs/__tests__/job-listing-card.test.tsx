import {fireEvent, render} from '@testing-library/react-native';
import React from 'react';
import {StyleSheet} from 'react-native';

import {JobListingCard} from '../components/JobListingCard';
import {getJobsIconLayout} from '../jobs-header.layout';
import type {CandidateJobCard} from '../jobs.types';

jest.mock('@expo/vector-icons/Ionicons', () => () => null);
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({children}: {children: React.ReactNode}) => children,
}));

const job: CandidateJobCard = {
  id: 4,
  key: 'project-lowongan:4',
  source: 'project-lowongan',
  title: 'Operator Produksi',
  company: 'PT HireLoop Indonesia',
  location: 'Karawang, Jawa Barat',
  contractType: 'Kontrak',
  workMode: 'On Site',
  salaryLabel: 'Rp6.000.000 - Rp7.000.000 / bulan',
  urgent: true,
  active: true,
  skills: ['Quality Control', 'Adaptability', 'Kolaborasi', 'Komunikasi', 'Safety'],
  applicantsCount: 3,
  closingDate: '2026-11-30',
  publishedAt: null,
  updatedAt: null,
  closingLabel: 'Berakhir 30 November 2026',
  publishedLabel: 'Tayang 5 hari yang lalu',
  updatedLabel: 'Diperbarui 2 hari yang lalu',
  workType: 'On Site',
  salary: 'Rp6.000.000 - Rp7.000.000 / bulan',
};

const iconLayout = getJobsIconLayout(390);

describe('JobListingCard', () => {
  it('renders API-backed vacancy fields and keeps both actions available', () => {
    const onApply = jest.fn();
    const onOpen = jest.fn();
    const screen = render(
      <JobListingCard
        iconLayout={iconLayout}
        job={job}
        saved={false}
        onApply={onApply}
        onOpen={onOpen}
        onShare={jest.fn()}
        onToggleSaved={jest.fn()}
      />,
    );

    expect(screen.getByText('Operator Produksi')).toBeTruthy();
    expect(screen.getByText('PT HireLoop Indonesia')).toBeTruthy();
    expect(screen.getByText('Dibutuhkan Segera')).toBeTruthy();
    expect(screen.getByText('3')).toBeTruthy();
    expect(screen.getByText('+1')).toBeTruthy();

    const detailButtonStyle = StyleSheet.flatten(screen.getByTestId('job-listing-detail-button').props.style);
    const detailTextStyle = StyleSheet.flatten(screen.getByText('Lihat Detail').props.style);
    expect(detailButtonStyle.alignItems).toBe('center');
    expect(detailButtonStyle.justifyContent).toBe('center');
    expect(detailTextStyle.fontFamily).toBe('PlusJakartaSans_700Bold');
    expect(detailTextStyle.fontSize).toBe(12.5);

    fireEvent.press(screen.getByText('Lamar sekarang'));
    fireEvent.press(screen.getByText('Lihat Detail'));
    expect(onApply).toHaveBeenCalledTimes(1);
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it('labels session-only bookmark state accessibly', () => {
    const screen = render(
      <JobListingCard
        iconLayout={iconLayout}
        job={job}
        saved={false}
        onApply={jest.fn()}
        onOpen={jest.fn()}
        onShare={jest.fn()}
        onToggleSaved={jest.fn()}
      />,
    );

    expect(screen.getByLabelText('Simpan lowongan untuk sesi ini')).toBeTruthy();
  });
});
