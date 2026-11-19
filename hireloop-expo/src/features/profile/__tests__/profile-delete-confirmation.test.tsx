import {fireEvent, render, waitFor} from '@testing-library/react-native';
import React from 'react';

import {ProfileDeleteConfirmation} from '../components/ProfileDeleteConfirmation';

jest.mock('@expo/vector-icons/Ionicons', () => () => null);
jest.mock('expo-router', () => ({router: {}}));

describe('ProfileDeleteConfirmation', () => {
  it('cancels without deleting and only runs the action after confirmation', async () => {
    const onCancel = jest.fn();
    const onConfirm = jest.fn().mockResolvedValue(undefined);
    const onDeleted = jest.fn();
    const view = render(<ProfileDeleteConfirmation embedded title="Hapus pendidikan?" message="SMA akan dihapus." onCancel={onCancel} onConfirm={onConfirm} onDeleted={onDeleted} />);

    fireEvent.press(view.getByRole('button', {name: 'Batal hapus'}));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();

    fireEvent.press(view.getByRole('button', {name: 'Konfirmasi hapus'}));
    await waitFor(() => expect(onDeleted).toHaveBeenCalledTimes(1));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('shows a failed delete in the popup and lets the user retry', async () => {
    const onConfirm = jest.fn()
      .mockRejectedValueOnce(new Error('Server belum dapat menghapus data.'))
      .mockResolvedValueOnce(undefined);
    const onDeleted = jest.fn();
    const view = render(<ProfileDeleteConfirmation title="Hapus dokumen?" message="CV akan dihapus." onCancel={jest.fn()} onConfirm={onConfirm} onDeleted={onDeleted} />);

    fireEvent.press(view.getByRole('button', {name: 'Konfirmasi hapus'}));
    expect(await view.findByText('Server belum dapat menghapus data.')).toBeTruthy();
    expect(onDeleted).not.toHaveBeenCalled();

    fireEvent.press(view.getByRole('button', {name: 'Konfirmasi hapus'}));
    await waitFor(() => expect(onDeleted).toHaveBeenCalledTimes(1));
    expect(onConfirm).toHaveBeenCalledTimes(2);
  });
});
