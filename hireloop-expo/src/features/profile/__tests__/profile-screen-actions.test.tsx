import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {fireEvent, render, waitFor} from '@testing-library/react-native';
import {File} from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import React from 'react';

import {httpClient} from '../../../core/api/http-client';
import {MAX_AVATAR_BYTES} from '../api/profile.api';
import {DocumentsScreen} from '../screens/DocumentsScreen';
import {PersonalDataScreen} from '../screens/PersonalDataScreen';
import {ProfileScreen} from '../screens/ProfileScreen';

jest.mock('@expo/vector-icons/Ionicons', () => () => null);
jest.mock('expo-router', () => ({router: {back: jest.fn()}}));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({top: 0, bottom: 0, left: 0, right: 0}),
}));
jest.mock('expo-file-system', () => ({
  File: jest.fn(),
  Paths: {cache: 'file:///cache'},
}));
jest.mock('expo-sharing', () => ({isAvailableAsync: jest.fn(), shareAsync: jest.fn()}));
jest.mock('expo-document-picker', () => ({}));
jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));
jest.mock('../../../core/api/http-client', () => ({
  httpClient: {get: jest.fn(), post: jest.fn(), delete: jest.fn()},
}));
jest.mock('../../../shared/components/ActionFeedbackProvider', () => ({
  useActionFeedback: () => ({runAction: ({operation}: {operation: () => Promise<unknown>}) => operation()}),
}));

const get = jest.mocked(httpClient.get);
const remove = jest.mocked(httpClient.delete);
const bytes = new Uint8Array([37, 80, 68, 70]);
const file = {
  id: 41,
  type: 'document',
  name: 'Dokumen Profil',
  original_name: 'profil.pdf',
};

function renderScreen(element: React.ReactElement) {
  const client = new QueryClient({defaultOptions: {
    queries: {retry: false, gcTime: Infinity},
    mutations: {gcTime: Infinity},
  }});
  return render(<QueryClientProvider client={client}>{element}</QueryClientProvider>);
}

it('shows education periods as abbreviated months and years', async () => {
  get.mockResolvedValueOnce({data: {data: {job_seeker: {id: 2, educations: [
    {id: 1, education_level: 'S1', start_date: '01/09/2021', end_date: '31/12/2025'},
    {id: 2, education_level: 'S2', start_date: '2026-01-01', end_date: null},
  ]}}}});
  const screen = renderScreen(<PersonalDataScreen />);

  expect(await screen.findByText('Sep 2021 - Des 2025')).toBeTruthy();
  expect(screen.getByText('Jan 2026 - Sekarang')).toBeTruthy();
});

describe('profile file actions', () => {
  let hasDocument: boolean;

  beforeEach(() => {
    jest.clearAllMocks();
    hasDocument = true;
    get.mockImplementation(async url => {
      if (url === '/job-seeker/documents-and-certifications') return {data: hasDocument ? [file] : []};
      if (url === '/job-seeker/documents/41/download') return {data: bytes.buffer};
      if (url === '/job-seeker/profile') return {data: {data: {user: {id: 1}, job_seeker: {id: 2}}}};
      throw new Error(`Unexpected endpoint ${url}`);
    });
  });

  it('downloads the document and hands its bytes to the device save menu', async () => {
    const create = jest.fn();
    const write = jest.fn();
    const uri = 'file:///cache/profile-downloads/document-41-0/profil.pdf';
    jest.mocked(File).mockReturnValue({uri, create, write} as unknown as File);
    jest.mocked(Sharing.isAvailableAsync).mockResolvedValue(true);
    const screen = renderScreen(<DocumentsScreen />);

    fireEvent.press(await screen.findByText('Unduh'));

    await waitFor(() => expect(Sharing.shareAsync).toHaveBeenCalledWith(uri, expect.objectContaining({mimeType: 'application/pdf'})));
    expect(get).toHaveBeenCalledWith('/job-seeker/documents/41/download', {responseType: 'arraybuffer'});
    expect(write).toHaveBeenCalledWith(bytes);
  });

  it('deletes a document only after confirmation and refreshes the list', async () => {
    remove.mockImplementation(async () => {
      hasDocument = false;
      return {status: 204};
    });
    const screen = renderScreen(<DocumentsScreen />);
    fireEvent.press(await screen.findByLabelText('Aksi Dokumen Profil'));
    fireEvent.press(screen.getByRole('button', {name: 'Hapus Dokumen'}));

    expect(screen.getByText('Hapus dokumen?')).toBeTruthy();
    expect(remove).not.toHaveBeenCalled();
    fireEvent.press(screen.getByRole('button', {name: 'Konfirmasi hapus'}));

    expect(await screen.findByText('Belum ada dokumen atau sertifikat.')).toBeTruthy();
    expect(remove).toHaveBeenCalledWith('/job-seeker/documents/41');
  });

  it('shows the profile photo size popup without posting the file', async () => {
    jest.mocked(ImagePicker.requestMediaLibraryPermissionsAsync).mockResolvedValue({
      granted: true,
    } as ImagePicker.MediaLibraryPermissionResponse);
    jest.mocked(ImagePicker.launchImageLibraryAsync).mockResolvedValue({
      canceled: false,
      assets: [{uri: 'file:///avatar.jpg', width: 1200, height: 1200, fileSize: MAX_AVATAR_BYTES + 1}],
    });
    const screen = renderScreen(<ProfileScreen />);
    fireEvent.press(await screen.findByLabelText('Ubah foto profil'));
    fireEvent.press(screen.getByRole('button', {name: 'Pilih foto dari galeri'}));

    expect(await screen.findByText('Gagal Memperbarui Foto')).toBeTruthy();
    expect(screen.getByText(/batas maksimal 2 MB/)).toBeTruthy();
    expect(httpClient.post).not.toHaveBeenCalled();
  });
});
