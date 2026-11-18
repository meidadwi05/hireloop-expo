import {render} from '@testing-library/react-native';
import React from 'react';
import {StyleSheet} from 'react-native';

import {JobsHeader} from '../components/JobsHeader';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({top: 24, right: 0, bottom: 0, left: 0}),
}));

jest.mock('@expo/vector-icons/Ionicons', () => {
  const ReactModule = jest.requireActual<typeof import('react')>('react');
  const {View: MockView} = jest.requireActual<typeof import('react-native')>('react-native');

  return function MockIonicon(props: Record<string, unknown>) {
    return ReactModule.createElement(MockView, props);
  };
});

describe('JobsHeader', () => {
  it('uses the Performance artwork with a safe back-button target', () => {
    const screen = render(
      <JobsHeader
        containerWidth={390}
      />,
    );

    const header = screen.getByTestId('jobs-header-background');
    const artwork = screen.getByTestId('jobs-header-artwork');
    const content = screen.getByTestId('jobs-header-content');
    const backButton = screen.getByLabelText('Kembali ke Beranda');
    const headerStyle = StyleSheet.flatten(header.props.style);
    const artworkStyle = StyleSheet.flatten(artwork.props.style);
    const contentStyle = StyleSheet.flatten(content.props.style);
    const backButtonStyle = StyleSheet.flatten(backButton.props.style);

    expect(artwork.props.resizeMode).toBe('contain');
    expect(headerStyle.backgroundColor).toBe('#0044B9');
    expect(headerStyle.height).toBeCloseTo(24 + (390 / (1983 / 416)), 1);
    expect(contentStyle.paddingHorizontal).toBe(16);
    expect(artworkStyle.top).toBe(24);
    expect(artworkStyle.left).toBe(0);
    expect(artworkStyle.width).toBe(390);
    expect(artworkStyle.height).toBeCloseTo(390 / (1983 / 416), 5);
    expect(backButtonStyle.height).toBe(44);
    expect(backButtonStyle.width).toBe(44);
    expect(backButtonStyle.overflow).toBe('visible');
    expect(screen.queryByLabelText('Lowongan tersimpan')).toBeNull();
    expect(screen.queryByLabelText('Cari posisi, perusahaan, atau lokasi')).toBeNull();
  });
});
