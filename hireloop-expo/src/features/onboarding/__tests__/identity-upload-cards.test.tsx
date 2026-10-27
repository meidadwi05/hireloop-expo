import {fireEvent, render} from '@testing-library/react-native';
import React from 'react';
import {StyleSheet} from 'react-native';

import {PersonalDataStep} from '../components/PersonalDataStep';
import {createEmptyOnboardingDraft} from '../onboarding.types';

jest.mock('../components/AddressFields', () => {
  const ReactModule = jest.requireActual<typeof import('react')>('react');
  const {Text, View} = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    AddressFields: ({label, afterAddressLine}: {label: string; afterAddressLine?: React.ReactNode}) => ReactModule.createElement(
      View,
      {testID: `address-fields-${label}`},
      ReactModule.createElement(Text, null, label),
      afterAddressLine,
    ),
  };
});

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

  it('mengurangi radius card dan menempatkan checkbox di slot alamat domisili', () => {
    const screen = render(
      <PersonalDataStep
        draft={createEmptyOnboardingDraft('Andi Permana')}
        dispatch={jest.fn()}
        majorOptions={[]}
        onNext={jest.fn()}
        runAction={jest.fn()}
      />,
    );

    const cardStyle = StyleSheet.flatten(screen.getByTestId('personal-information-card').props.style);
    expect(cardStyle.borderRadius).toBe(22);
    expect(screen.getByTestId('same-address-after-domicile')).toBeTruthy();
    expect(screen.getByTestId('address-fields-Alamat Domisili').findByProps({testID: 'same-address-after-domicile'})).toBeTruthy();
  });
});
