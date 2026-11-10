import {fireEvent, render} from '@testing-library/react-native';
import React from 'react';

import {JobCard} from '../../../dashboard/DashboardHome';
import {JobListingCard} from '../components/JobListingCard';
import {getJobsIconLayout} from '../jobs-header.layout';
import type {CandidateJobCard} from '../jobs.types';

jest.mock('@expo/vector-icons/Ionicons', () => {
  const ReactModule = jest.requireActual<typeof import('react')>('react');
  const {View: NativeView} = jest.requireActual<typeof import('react-native')>('react-native');
  function MockIonicons(props: object) {
    return ReactModule.createElement(NativeView, props);
  }
  return MockIonicons;
});
jest.mock('expo-router', () => ({router: {push: jest.fn()}}));
jest.mock('expo-linear-gradient', () => ({LinearGradient: ({children}: {children: React.ReactNode}) => children}));
jest.mock('../../dashboard/hooks/use-dashboard-home', () => ({useDashboardHome: jest.fn()}));

const job: CandidateJobCard = {
  id: 4,
  key: 'project-lowongan:4',
  source: 'project-lowongan',
  title: 'Operator Produksi',
  company: 'PT HireLoop Indonesia',
  location: 'Karawang',
  contractType: 'Kontrak',
  workMode: 'On Site',
  salaryLabel: 'Rp6.000.000 / bulan',
  urgent: false,
  active: true,
  skills: [],
  applicantsCount: 3,
  closingDate: null,
  publishedAt: null,
  updatedAt: null,
  closingLabel: 'Masih dibuka',
  publishedLabel: 'Tayang hari ini',
  updatedLabel: 'Diperbarui hari ini',
  workType: 'On Site',
  salary: 'Rp6.000.000 / bulan',
};

describe('job card action feedback', () => {
  it('mewarnai bookmark dan share pada card daftar lowongan', () => {
    const screen = render(
      <JobListingCard
        iconLayout={getJobsIconLayout(390)}
        job={job}
        saved
        onApply={jest.fn()}
        onOpen={jest.fn()}
        onShare={jest.fn()}
        onToggleSaved={jest.fn()}
      />,
    );

    expect(screen.getByTestId('job-listing-bookmark-icon').props.color).toBe('#0865FF');
    fireEvent.press(screen.getByTestId('job-listing-share-button'));
    expect(screen.getByTestId('job-listing-share-icon').props.color).toBe('#0865FF');
    expect(screen.getByLabelText('Lowongan telah dibagikan')).toBeTruthy();
  });

  it('mewarnai bookmark dan share pada card rekomendasi dashboard', () => {
    const screen = render(
      <JobCard
        job={job}
        width={360}
        saved
        onApply={jest.fn()}
        onOpen={jest.fn()}
        onShare={jest.fn()}
        onToggleSaved={jest.fn()}
      />,
    );

    expect(screen.getByTestId('dashboard-job-bookmark-icon').props.color).toBe('#146CFF');
    fireEvent.press(screen.getByTestId('dashboard-job-share-button'), {stopPropagation: jest.fn()});
    expect(screen.getByTestId('dashboard-job-share-icon').props.color).toBe('#146CFF');
    expect(screen.getByLabelText('Lowongan telah dibagikan')).toBeTruthy();
  });
});
