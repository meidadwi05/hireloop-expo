import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {fireEvent, render} from '@testing-library/react-native';
import React from 'react';

import {useCandidateApplyAccess} from '../../auth/hooks/use-candidate-apply-access';
import {jobsApi} from '../api/jobs.api';
import {JobDetailScreen} from '../components/JobDetailScreen';
import {mapJobDetail} from '../jobs.mapper';

jest.mock('@expo/vector-icons/Ionicons', () => () => null);
jest.mock('expo-router', () => ({router: {replace: jest.fn()}}));
jest.mock('../../notifications/push-notifications', () => ({offerInterviewPushPermission: jest.fn().mockResolvedValue(undefined)}));
jest.mock('expo-linear-gradient', () => ({LinearGradient: jest.requireActual('react-native').View}));
jest.mock('react-native-safe-area-context', () => ({SafeAreaView: jest.requireActual('react-native').View}));
jest.mock('../../../components/ui/CandidatePageHeader', () => ({CandidatePageHeader: () => null}));
jest.mock('../../../shared/components/ActionFeedbackProvider', () => ({useActionFeedback: () => ({})}));
jest.mock('../../auth/hooks/use-candidate-apply-access', () => ({useCandidateApplyAccess: jest.fn()}));
jest.mock('../api/jobs.api', () => ({jobsApi: {detail: jest.fn(), apply: jest.fn()}}));
jest.mock('../components/JobApplicationRequirementsSheet', () => {
  const ReactModule = jest.requireActual<typeof import('react')>('react');
  const {Text} = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    JobApplicationRequirementsSheet: ({visible}: {visible: boolean}) => visible
      ? ReactModule.createElement(Text, null, 'Form Persyaratan Lamaran')
      : null,
  };
});

function renderDetail(jobApplications: Record<string, unknown>[]) {
  jest.mocked(jobsApi.detail).mockResolvedValue({
    ...mapJobDetail({id: 41, title: 'Operator Produksi'}, 'project-lowongan'),
    active: true,
  });
  jest.mocked(useCandidateApplyAccess).mockReturnValue({
    candidate: {
      id: 1, full_name: 'Kandidat', email: 'candidate@example.com', avatar_url: null, cover_url: null,
      profile_completed_at: null, is_verified: true, prod_candidate: false, onboarding_finished: true,
      role: 'user', roles: ['user'], job_applications: jobApplications,
    },
    blacklistInfo: null, isTier2Banned: false, isError: false, isLoading: false, isRefetching: false, refetch: jest.fn(),
  });

  const client = new QueryClient({defaultOptions: {queries: {retry: false, gcTime: Infinity}}});
  return render(
    <QueryClientProvider client={client}>
      <JobDetailScreen source="project-lowongan" id={41} />
    </QueryClientProvider>,
  );
}

it('disables the apply button and shows the gray gradient for a matching application', async () => {
  const screen = renderDetail([{id: 5, job_reference_type: 'project-lowongan', job_reference_id: 41, application_status: 'Screening'}]);

  const button = await screen.findByRole('button', {name: 'Sudah Dilamar', disabled: true});
  expect(screen.getByTestId('job-detail-applied-gradient').props.colors).toEqual(['#667085', '#475467']);
  fireEvent.press(button);
  expect(screen.queryByText('Form Persyaratan Lamaran')).toBeNull();
});

it('keeps the apply action available for a canceled application or a different source', async () => {
  const screen = renderDetail([
    {id: 5, job_reference_type: 'project-lowongan', job_reference_id: 41, application_status: 'Dibatalkan'},
    {id: 6, job_reference_type: 'job-posting', job_reference_id: 41, application_status: 'Applied'},
  ]);

  fireEvent.press(await screen.findByRole('button', {name: 'Lamar sekarang', disabled: false}));
  expect(screen.getByText('Form Persyaratan Lamaran')).toBeTruthy();
  expect(screen.queryByTestId('job-detail-applied-gradient')).toBeNull();
});
