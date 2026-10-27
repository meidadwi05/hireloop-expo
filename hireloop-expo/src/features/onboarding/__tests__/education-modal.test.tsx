import {fireEvent, render} from '@testing-library/react-native';
import React from 'react';
import {Modal} from 'react-native';

import {EducationModal} from '../components/EducationModal';

jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}));

describe('modal pendidikan onboarding', () => {
  it('menampilkan editor dalam satu modal dan menyimpan major id dari master data', () => {
    const onSave = jest.fn();
    const screen = render(
      <EducationModal
        visible
        initialValue={null}
        majorOptions={[{value: '17', label: 'Manajemen'}]}
        onCancel={jest.fn()}
        onSave={onSave}
      />,
    );

    expect(screen.getByTestId('education-modal-card')).toBeTruthy();
    expect(screen.UNSAFE_getAllByType(Modal)).toHaveLength(1);

    fireEvent.press(screen.getByLabelText('Tingkat Pendidikan'));
    expect(screen.getByTestId('inline-options-Tingkat Pendidikan')).toBeTruthy();
    fireEvent.press(screen.getByText('S1'));

    fireEvent.press(screen.getByLabelText('Jurusan'));
    expect(screen.getByTestId('inline-options-Jurusan')).toBeTruthy();
    fireEvent.press(screen.getByText('Manajemen'));
    fireEvent.press(screen.getByText('Tambah'));

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
      educationLevel: 'S1',
      majorId: 17,
      majorName: 'Manajemen',
    }));
  });

  it('menampilkan error master jurusan dan menyediakan aksi coba lagi', () => {
    const onRetryMajors = jest.fn();
    const screen = render(
      <EducationModal
        visible
        initialValue={null}
        majorOptions={[]}
        majorError
        onRetryMajors={onRetryMajors}
        onCancel={jest.fn()}
        onSave={jest.fn()}
      />,
    );

    expect(screen.getByText('Jurusan belum dapat dimuat.')).toBeTruthy();
    fireEvent.press(screen.getByText('Coba lagi'));
    expect(onRetryMajors).toHaveBeenCalledTimes(1);
  });

  it('menampilkan status loading master jurusan tanpa mengosongkan modal', () => {
    const screen = render(
      <EducationModal
        visible
        initialValue={null}
        majorOptions={[]}
        majorLoading
        onCancel={jest.fn()}
        onSave={jest.fn()}
      />,
    );

    expect(screen.getByTestId('education-modal-card')).toBeTruthy();
    expect(screen.getByText('Memuat jurusan...')).toBeTruthy();
  });
});
