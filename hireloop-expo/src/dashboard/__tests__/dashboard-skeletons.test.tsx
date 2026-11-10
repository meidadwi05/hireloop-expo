import {render} from '@testing-library/react-native';
import React from 'react';

import {
  InterviewCardSkeleton,
  RecentApplicationsSkeleton,
  RecommendationSkeleton,
  SummaryGridSkeleton,
} from '../components/DashboardSkeletons';

jest.mock('../components/ShimmerBlock', () => {
  const ReactModule = jest.requireActual<typeof import('react')>('react');
  const {View: NativeView} = jest.requireActual<typeof import('react-native')>('react-native');
  return {ShimmerBlock: (props: object) => ReactModule.createElement(NativeView, props)};
});

describe('dashboard shimmer skeletons', () => {
  it('menyediakan placeholder terpisah untuk setiap data dashboard', () => {
    const screen = render(
      <>
        <SummaryGridSkeleton compact={false} gap={10} minHeight={94} />
        <InterviewCardSkeleton compact={false} dateWidth={72} />
        <RecentApplicationsSkeleton compact={false} />
        <RecommendationSkeleton cardWidth={322} compact={false} />
      </>,
    );

    expect(screen.getByTestId('dashboard-summary-shimmer')).toBeTruthy();
    expect(screen.getByTestId('dashboard-interview-shimmer')).toBeTruthy();
    expect(screen.getByTestId('dashboard-applications-shimmer')).toBeTruthy();
    expect(screen.getByTestId('dashboard-recommendations-shimmer')).toBeTruthy();
  });

  it('tetap dapat dirender dalam mode compact tanpa placeholder melebar keluar', () => {
    const screen = render(
      <>
        <SummaryGridSkeleton compact gap={8} minHeight={86} />
        <InterviewCardSkeleton compact dateWidth={64} />
        <RecentApplicationsSkeleton compact />
        <RecommendationSkeleton cardWidth={248} compact />
      </>,
    );

    expect(screen.getAllByRole('progressbar')).toHaveLength(4);
  });
});
