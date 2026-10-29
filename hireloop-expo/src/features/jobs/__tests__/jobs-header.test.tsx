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
  it('keeps the complete artwork explicitly anchored inside the blue header', () => {
    const screen = render(
      <JobsHeader
        containerWidth={390}
        horizontalPadding={20}
        search=""
        onChangeSearch={jest.fn()}
        onOpenSaved={jest.fn()}
      />,
    );

    const header = screen.getByTestId('jobs-header-background');
    const artwork = screen.getByTestId('jobs-header-artwork');
    const headerStyle = StyleSheet.flatten(header.props.style);
    const artworkStyle = StyleSheet.flatten(artwork.props.style);

    expect(artwork.props.resizeMode).toBe('contain');
    expect(headerStyle.backgroundColor).toBe('#00419E');
    expect(headerStyle.height).toBe(157);
    expect(headerStyle.paddingHorizontal).toBe(20);
    expect(artworkStyle.top).toBe(0);
    expect(artworkStyle.right).toBe(0);
    expect(artworkStyle.width).toBeLessThanOrEqual(390);
    expect(artworkStyle.height).toBeLessThanOrEqual(157);
  });
});
