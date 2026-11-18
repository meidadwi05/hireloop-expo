import {fireEvent, render} from '@testing-library/react-native';
import React from 'react';
import {StyleSheet} from 'react-native';

import type {ApplicationStage} from '../applications.types';
import {ApplicationRecruitmentProgress} from '../components/ApplicationRecruitmentProgress';

jest.mock('@expo/vector-icons/Ionicons', () => () => null);

const emptyDetails = {icon: null, color: null, histories: [], results: [], schedules: [], offerings: []};

const stages: ApplicationStage[] = [
  {
    ...emptyDetails,
    index: 0,
    value: 'applied',
    label: 'Applied',
    type: 'applied',
    status: 'Completed',
    isCurrent: false,
    isCompleted: true,
    startedAt: '2026-11-01T09:00:00+07:00',
    completedAt: '2026-11-01T09:00:00+07:00',
    note: null,
  },
  {
    ...emptyDetails,
    index: 1,
    value: 'interview-hr-user',
    label: 'Interview HR & User',
    type: 'interview',
    status: 'In Progress',
    isCurrent: true,
    isCompleted: false,
    startedAt: '2026-11-10T11:33:00+07:00',
    completedAt: null,
    note: null,
    schedules: [{
      id: 10,
      stageIndex: 1,
      stageValue: 'interview-hr-user',
      stageLabel: 'Interview HR & User',
      type: 'interview',
      agenda: 'Interview HRss',
      date: '2026-12-08',
      startTime: '10:21:00',
      endTime: null,
      method: 'Online',
      locationPlatform: 'Zoom',
      addressLink: 'https://zoom.example.test',
      addressMapsUrl: null,
      sessionId: null,
      note: 'Harus pakai celana',
      status: 'Scheduled',
      rescheduleCount: 0,
      medicalResult: null,
      cancellationReason: null,
      cancellationAfterAction: null,
      cancellationNote: null,
      createdAt: '2026-11-10T11:33:00+07:00',
      updatedAt: '2026-11-10T11:33:00+07:00',
    }],
  },
  {
    ...emptyDetails,
    index: 2,
    value: 'offering',
    label: 'Offering',
    type: 'offering',
    status: 'Pending',
    isCurrent: false,
    isCompleted: false,
    startedAt: null,
    completedAt: null,
    note: null,
  },
];

describe('ApplicationRecruitmentProgress', () => {
  it('menampilkan detail tahap aktif dan mengganti card saat bullet yang tercapai ditekan', () => {
    const screen = render(<ApplicationRecruitmentProgress stages={stages} currentStageIndex={1} />);

    expect(screen.getByText('Interview HRss')).toBeTruthy();
    expect(screen.getByText('Zoom')).toBeTruthy();
    expect(screen.getByTestId('application-progress-vertical')).toBeTruthy();
    expect(screen.getByTestId('application-progress-detail-scroll').props.nestedScrollEnabled).toBe(true);

    fireEvent.press(screen.getByLabelText('Lihat tahap Applied'));
    expect(screen.getByText('Detail aktivitas tahap ini belum tersedia.')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Buka detail tahap Offering'));
    expect(screen.getByText('Detail aktivitas tahap ini belum tersedia.')).toBeTruthy();
    expect(screen.queryByLabelText('Lihat tahap Offering')).toBeNull();
    expect(screen.getByTestId('application-progress-node-placeholder-offering-2')).toBeTruthy();
    expect(screen.getByLabelText('Buka detail tahap Offering').props.accessibilityState.disabled).toBe(true);
  });

  it('menampilkan tahap sebelum Hired sebagai selesai, sama seperti tahap selesai lainnya', () => {
    const hiredStages: ApplicationStage[] = [
      {...stages[0], isCompleted: true, isCurrent: false},
      {...stages[1], status: 'Completed', isCompleted: true, isCurrent: false},
      {...stages[2], status: 'Pending', isCompleted: false, isCurrent: false},
      {
        ...emptyDetails,
        index: 3,
        value: 'hired',
        label: 'Hired',
        type: 'terminal',
        status: 'Completed',
        isCurrent: true,
        isCompleted: true,
        startedAt: '2026-11-18T09:00:00+07:00',
        completedAt: '2026-11-18T09:00:00+07:00',
        note: null,
      },
    ];
    const screen = render(<ApplicationRecruitmentProgress stages={hiredStages} currentStageIndex={3} />);

    const previousStage = screen.getByLabelText('Lihat tahap Offering');
    expect(previousStage.props.accessibilityState.disabled).toBe(false);
    expect(previousStage.props.accessibilityState.selected).toBe(false);
    expect(StyleSheet.flatten(screen.getByTestId('application-progress-node-offering-2').props.style).backgroundColor).toBe('#16B97B');
  });
});
