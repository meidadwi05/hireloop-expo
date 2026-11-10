import * as Linking from 'expo-linking';

import {interviewDestination, isSafeExternalUrl} from './dashboard.interviews';
import type {DashboardInterview} from './dashboard.types';

export async function openInterviewDestination(interview: DashboardInterview) {
  const destination = interviewDestination(interview);
  if (!destination || !isSafeExternalUrl(destination)) {
    throw new Error(interview.mode === 'online'
      ? 'Tautan interview belum tersedia.'
      : 'Tautan lokasi interview belum tersedia.');
  }

  const supported = await Linking.canOpenURL(destination);
  if (!supported) throw new Error('Tautan tidak didukung pada perangkat ini.');

  await Linking.openURL(destination);
}
