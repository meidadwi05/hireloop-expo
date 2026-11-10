import {render} from '@testing-library/react-native';
import React from 'react';

import {ApplicationsListSkeleton, ApplicationTimelineSkeleton} from '../applications/components/ApplicationSkeletons';
import {JobDetailSkeleton} from '../jobs/components/JobDetailSkeleton';
import {JobsListSkeleton} from '../jobs/components/JobsListSkeleton';
import {NotificationsListSkeleton} from '../notifications/components/NotificationsListSkeleton';
import {ProfileLoadingSkeleton} from '../profile/components/ProfileLoadingSkeleton';

jest.mock('../../shared/components/shimmer', () => {
  const ReactModule = jest.requireActual<typeof import('react')>('react');
  const {View: NativeView} = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    ShimmerBlock: (props: object) => ReactModule.createElement(NativeView, props),
    ShimmerGroup: ({children}: {children: React.ReactNode}) => ReactModule.createElement(ReactModule.Fragment, null, children),
  };
});

describe('mobile shimmer skeletons', () => {
  it('merender skeleton untuk alur lamaran dan lowongan', () => {
    const screen = render(
      <>
        <ApplicationsListSkeleton horizontalPadding={18} />
        <ApplicationTimelineSkeleton />
        <JobsListSkeleton />
        <JobDetailSkeleton />
      </>,
    );

    expect(screen.getByTestId('applications-list-skeleton')).toBeTruthy();
    expect(screen.getByTestId('application-timeline-skeleton')).toBeTruthy();
    expect(screen.getByTestId('jobs-list-skeleton')).toBeTruthy();
    expect(screen.getByTestId('job-detail-skeleton')).toBeTruthy();
  });

  it('merender skeleton notifikasi dan setiap varian profil', () => {
    const variants = ['profile', 'personal', 'experience', 'skills', 'documents', 'work-preference'] as const;
    const screen = render(
      <>
        <NotificationsListSkeleton horizontalPadding={18} />
        {variants.map(variant => <ProfileLoadingSkeleton key={variant} variant={variant} />)}
      </>,
    );

    expect(screen.getByTestId('notifications-list-skeleton')).toBeTruthy();
    variants.forEach(variant => expect(screen.getByTestId(`profile-${variant}-skeleton`)).toBeTruthy());
  });
});
