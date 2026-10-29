import AsyncStorage from '@react-native-async-storage/async-storage';
import {act, renderHook, waitFor} from '@testing-library/react-native';
import React, {PropsWithChildren} from 'react';

import {SavedJobsProvider, useSavedJobs} from '../saved-jobs-provider';
import type {CandidateJobCard} from '../jobs.types';

const job: CandidateJobCard = {
  id: 21,
  key: 'job-posting:21',
  source: 'job-posting',
  title: 'Product Designer',
  company: 'HireLoop',
  location: 'Jakarta',
  contractType: 'Kontrak',
  workMode: 'Hybrid',
  salaryLabel: 'Rp 8.000.000',
  urgent: false,
  active: true,
  skills: ['Figma'],
  applicantsCount: 4,
  closingDate: '2026-11-30',
  publishedAt: '2026-10-20',
  updatedAt: '2026-10-28',
  closingLabel: 'Berakhir 30 November 2026',
  publishedLabel: 'Tayang 8 hari lalu',
  updatedLabel: 'Diperbarui hari ini',
  workType: 'Hybrid',
  salary: 'Rp 8.000.000',
};

function wrapper({children}: PropsWithChildren) {
  return <SavedJobsProvider>{children}</SavedJobsProvider>;
}

describe('SavedJobsProvider', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  it('menyimpan dan menghapus lowongan menggunakan key yang konsisten', async () => {
    const {result} = renderHook(() => useSavedJobs(), {wrapper});
    await waitFor(() => expect(result.current.hydrated).toBe(true));

    act(() => result.current.toggleSaved(job));
    expect(result.current.savedCount).toBe(1);
    expect(result.current.isSaved(job.key)).toBe(true);
    expect(result.current.savedJobs[0]).toEqual(job);

    await waitFor(() => expect(AsyncStorage.setItem).toHaveBeenCalled());

    act(() => result.current.toggleSaved(job));
    expect(result.current.savedCount).toBe(0);
    expect(result.current.isSaved(job.key)).toBe(false);
  });
});
