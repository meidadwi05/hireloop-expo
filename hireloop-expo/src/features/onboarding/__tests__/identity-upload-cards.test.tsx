import {fireEvent, render} from '@testing-library/react-native';
import React from 'react';

import {PersonalDataStep} from '../components/PersonalDataStep';
import {createEmptyOnboardingDraft} from '../onboarding.types';

jest.mock('../components/AddressFields', () => ({
  AddressFields: () => null,
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}));

describe('card upload identitas onboarding', () => {
  it('menampilkan card KTP dan foto profil sebelum informasi pribadi', () => {
    const screen = render(
      <PersonalDataStep
        draft={createEmptyOnboardingDraft('Andi Permana')}
        dispatch={jest.fn()}
        majorOptions={[]}
        onNext={jest.fn()}
        runAction={jest.fn()}
      />,
    );

    expect(screen.getByTestId('identity-upload-cards')).toBeTruthy();
    expect(screen.getByTestId('ktp-upload-card')).toBeTruthy();
    expect(screen.getByText('Upload KTP')).toBeTruthy();
    expect(screen.getByText('Ambil Foto KTP')).toBeTruthy();
    expect(screen.getByText('Unggah Foto')).toBeTruthy();
    expect(screen.getByTestId('profile-photo-card')).toBeTruthy();
    expect(screen.getByText('Foto Profil')).toBeTruthy();
    expect(screen.getByText('Pilih dari Galeri')).toBeTruthy();
    expect(screen.getByTestId('personal-information-card')).toBeTruthy();
  });

  it('menampilkan NIK wajib sebagai field lokal 16 digit', () => {
    const screen = render(
      <PersonalDataStep
        draft={createEmptyOnboardingDraft('Andi Permana')}
        dispatch={jest.fn()}
        majorOptions={[]}
        onNext={jest.fn()}
        runAction={jest.fn()}
      />,
    );

    const nikInput = screen.getByLabelText('NIK');
    fireEvent.changeText(nikInput, '3275-0101-0190-0001-extra');

    expect(nikInput.props.value).toBe('3275010101900001');
  });
});
