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
  it('uses the shorter artwork without adding excess space below the title', () => {
    const screen = render(
      <JobsHeader
        containerWidth={390}
        horizontalPadding={20}
      />,
    );

    const header = screen.getByTestId('jobs-header-background');
    const artwork = screen.getByTestId('jobs-header-artwork');
    const content = screen.getByTestId('jobs-header-content');
    const headerStyle = StyleSheet.flatten(header.props.style);
    const artworkStyle = StyleSheet.flatten(artwork.props.style);
    const contentStyle = StyleSheet.flatten(content.props.style);

    expect(artwork.props.resizeMode).toBe('contain');
    expect(headerStyle.backgroundColor).toBe('#00419E');
    expect(headerStyle.height).toBeCloseTo(390 / (1983 / 515), 1);
    expect(contentStyle.paddingHorizontal).toBe(20);
    expect(artworkStyle.top).toBe(0);
    expect(artworkStyle.left).toBe(0);
    expect(artworkStyle.width).toBe(390);
    expect(artworkStyle.height).toBeCloseTo(headerStyle.height, 5);
    expect(screen.queryByLabelText('Lowongan tersimpan')).toBeNull();
    expect(screen.queryByLabelText('Cari posisi, perusahaan, atau lokasi')).toBeNull();
  });
});
