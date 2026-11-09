import {act, fireEvent, render} from '@testing-library/react-native';
import React from 'react';
import {Pressable, Text} from 'react-native';

import {ActionFeedbackProvider, useActionFeedback} from '../ActionFeedbackProvider';

jest.mock('@expo/vector-icons', () => ({Ionicons: () => null}));

function ActionHarness({onExit}: {onExit: () => void}) {
  const feedback = useActionFeedback();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => void feedback.runAction({
        loadingMessage: 'Menyimpan perubahan...',
        successTitle: 'Berhasil',
        successMessage: 'Perubahan sudah disimpan.',
        operation: async () => 'saved',
        onSuccessExit: onExit,
      })}
    >
      <Text>Simpan</Text>
    </Pressable>
  );
}

describe('ActionFeedbackProvider', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('menjalankan loading, status sukses, lalu keluar otomatis secara berurutan', async () => {
    const onExit = jest.fn();
    const screen = render(
      <ActionFeedbackProvider>
        <ActionHarness onExit={onExit} />
      </ActionFeedbackProvider>,
    );

    fireEvent.press(screen.getByText('Simpan'));
    expect(screen.getByText('Mohon tunggu')).toBeTruthy();
    expect(screen.getByText('Menyimpan perubahan...')).toBeTruthy();

    await act(async () => {
      jest.advanceTimersByTime(600);
      await Promise.resolve();
    });
    expect(screen.getByText('Berhasil')).toBeTruthy();
    expect(onExit).not.toHaveBeenCalled();

    act(() => jest.advanceTimersByTime(1400));
    expect(screen.queryByText('Berhasil')).toBeNull();
    expect(onExit).toHaveBeenCalledTimes(1);
  });
});
