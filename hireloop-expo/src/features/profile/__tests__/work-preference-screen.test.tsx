import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {fireEvent, render, waitFor} from '@testing-library/react-native';
import React from 'react';

import {httpClient} from '../../../core/api/http-client';
import type {WorkPreferenceInput} from '../profile.types';
import {WorkPreferenceScreen} from '../screens/WorkPreferenceScreen';

jest.mock('@expo/vector-icons/Ionicons', () => () => null);
jest.mock('expo-router', () => ({router: {back: jest.fn()}}));
jest.mock('../../../shared/components/ActionFeedbackProvider', () => ({
  useActionFeedback: () => ({runAction: ({operation}: {operation: () => Promise<unknown>}) => operation()}),
}));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({top: 0, bottom: 0, left: 0, right: 0}),
}));
jest.mock('../../../core/api/http-client', () => ({httpClient: {get: jest.fn(), put: jest.fn()}}));

const get = jest.mocked(httpClient.get);
const put = jest.mocked(httpClient.put);
const taxonomyRole = {id: 71, role: 'Data Analyst'};

function renderPreferences() {
  const client = new QueryClient({defaultOptions: {
    queries: {retry: false, gcTime: Infinity},
    mutations: {gcTime: Infinity},
  }});
  return render(
    <QueryClientProvider client={client}>
      <WorkPreferenceScreen />
    </QueryClientProvider>,
  );
}

describe('WorkPreferenceScreen', () => {
  let savedRoles: {role_taxonomy_id: number; role_name: string}[];

  beforeEach(() => {
    jest.clearAllMocks();
    savedRoles = [];
    get.mockImplementation(async url => {
      if (url === '/roles') return {data: {success: true, data: [taxonomyRole]}};
      if (url === '/job-seeker/profile') {
        return {data: {data: {user: {id: 1}, job_seeker: {job_preferences: savedRoles}}}};
      }
      throw new Error(`Unexpected endpoint ${url}`);
    });
    put.mockImplementation(async (_url, payload) => {
      const {job_preferences} = payload as WorkPreferenceInput;
      savedRoles = job_preferences.map(role => ({...role, role_name: taxonomyRole.role}));
      return {data: {success: true}};
    });
  });

  it('saves the selected taxonomy ID and shows the saved role when reopened', async () => {
    const screen = renderPreferences();
    fireEvent.changeText(await screen.findByLabelText('Cari posisi yang diminati'), 'Data');
    fireEvent.press(await screen.findByText(taxonomyRole.role));
    fireEvent.press(screen.getByRole('button', {name: 'Simpan Preferensi'}));

    await waitFor(() => expect(put).toHaveBeenCalledWith('/job-seeker/work-preferences', expect.objectContaining({
      job_preferences: [{role_taxonomy_id: 71}],
    })));
    await screen.findByRole('button', {name: 'Simpan Preferensi'});
    expect(get).toHaveBeenCalledWith('/roles');
    screen.unmount();

    const reopened = renderPreferences();
    expect(await reopened.findByRole('button', {name: 'Hapus Data Analyst'})).toBeTruthy();
  });

  it('identifies an unavailable saved role and allows saving after it is removed', async () => {
    savedRoles = [{role_taxonomy_id: 99, role_name: 'Posisi Lama'}];
    const screen = renderPreferences();
    expect(await screen.findByText('Hapus posisi yang sudah tidak tersedia: Posisi Lama.')).toBeTruthy();

    fireEvent.changeText(screen.getByLabelText('Cari posisi yang diminati'), 'Data');
    fireEvent.press(screen.getByText(taxonomyRole.role));
    fireEvent.press(screen.getByRole('button', {name: 'Simpan Preferensi'}));
    expect(put).not.toHaveBeenCalled();

    fireEvent.press(screen.getByRole('button', {name: 'Hapus Posisi Lama'}));
    fireEvent.press(screen.getByRole('button', {name: 'Simpan Preferensi'}));
    await waitFor(() => expect(put).toHaveBeenCalledWith('/job-seeker/work-preferences', expect.objectContaining({
      job_preferences: [{role_taxonomy_id: 71}],
    })));
  });
});
