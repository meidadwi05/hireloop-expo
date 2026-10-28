import {fireEvent, render} from '@testing-library/react-native';
import React from 'react';

import type {ApplicationCardModel} from '../applications.types';
import {ApplicationCard} from '../components/ApplicationCard';

jest.mock('@expo/vector-icons/Ionicons', () => () => null);

const model: ApplicationCardModel = {
  key: 'project-lowongan:24:application',
  savedOnly: false,
  application: {
    applicationId: 91,
    source: 'project-lowongan',
    referenceId: 24,
    storageKind: 'applicant-data',
    title: 'Yupi Batch 2 Operator Produksi',
    company: 'PT Yupi Indo Jelly Gum',
    location: 'Bekasi, Jawa Barat',
    applicationStatus: 'Offering',
    stageStatus: 'In Progress',
    currentStageIndex: 2,
    currentStageValue: 'offering',
    currentStageLabel: 'Offering',
    state: 'in-progress',
    submittedAt: '2026-09-30T11:13:00+07:00',
    updatedAt: '2026-09-30T11:14:00+07:00',
    canceledAt: null,
    isTemporary: false,
    isTransferred: false,
    transferNote: null,
    stages: [
      {index: 0, value: 'applied', label: 'Applied', type: null, status: 'Completed', isCurrent: false, isCompleted: true, startedAt: '2026-09-30T11:13:00+07:00', completedAt: '2026-09-30T11:13:00+07:00', note: null},
      {index: 1, value: 'screening', label: 'Screening', type: null, status: 'Completed', isCurrent: false, isCompleted: true, startedAt: null, completedAt: '2026-09-30T11:14:00+07:00', note: null},
      {index: 2, value: 'offering', label: 'Offering', type: null, status: 'In Progress', isCurrent: true, isCompleted: false, startedAt: '2026-09-30T11:14:00+07:00', completedAt: null, note: null},
      {index: 3, value: 'medical', label: 'Medical', type: null, status: 'Pending', isCurrent: false, isCompleted: false, startedAt: null, completedAt: null, note: null},
    ],
  },
  job: {
    id: 24,
    key: 'project-lowongan:24',
    source: 'project-lowongan',
    title: 'Yupi Batch 2 Operator Produksi',
    company: 'PT Yupi Indo Jelly Gum',
    location: 'Bekasi, Jawa Barat',
    contractType: 'Outsourcing',
    workMode: 'On Site',
    salaryLabel: 'Rp10.000.000 - Rp20.000.000 / bulan',
    urgent: false,
    active: true,
    skills: [],
    applicantsCount: 0,
    closingDate: '2026-09-29',
    publishedAt: '2026-09-01',
    updatedAt: '2026-09-30',
    closingLabel: 'Berakhir 29 September 2026',
    publishedLabel: '',
    updatedLabel: '',
    workType: 'On Site',
    salary: 'Rp10.000.000 - Rp20.000.000 / bulan',
    description: '',
    requirements: [],
    benefits: [],
    education: 'SMA',
    experience: '1 tahun',
  },
};

describe('ApplicationCard', () => {
  it('menampilkan metadata, status, timeline, dan membuka detail', () => {
    const onOpen = jest.fn();
    const screen = render(<ApplicationCard model={model} onOpen={onOpen} />);

    expect(screen.getByText('Yupi Batch 2 Operator Produksi')).toBeTruthy();
    expect(screen.getByText('PT Yupi Indo Jelly Gum')).toBeTruthy();
    expect(screen.getAllByText('Offering').length).toBeGreaterThan(0);
    expect(screen.getByText('Medical')).toBeTruthy();
    expect(screen.getByText('Lihat Detail')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Lihat detail lamaran Yupi Batch 2 Operator Produksi'));
    expect(onOpen).toHaveBeenCalledTimes(1);
  });
});
