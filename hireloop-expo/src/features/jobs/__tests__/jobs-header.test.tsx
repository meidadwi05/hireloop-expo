import {render} from '@testing-library/react-native';
import React from 'react';
import {StyleSheet, View} from 'react-native';

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
  it('keeps the complete artwork and location controls inside the blue header', () => {
    const screen = render(
      <JobsHeader
        containerWidth={390}
        horizontalPadding={20}
        search=""
        onChangeSearch={jest.fn()}
        onOpenSaved={jest.fn()}
      >
        <View testID="jobs-location-controls" />
      </JobsHeader>,
    );

    const header = screen.getByTestId('jobs-header-background');
    const artwork = screen.getByTestId('jobs-header-artwork');
    const headerStyle = StyleSheet.flatten(header.props.style);

    expect(artwork.props.resizeMode).toBe('contain');
    expect(headerStyle.backgroundColor).toBe('#00419E');
    expect(headerStyle.paddingHorizontal).toBe(20);
    expect(header.findByProps({testID: 'jobs-location-controls'})).toBeTruthy();
  });
});
