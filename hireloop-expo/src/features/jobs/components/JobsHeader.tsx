import React from 'react';

import {CandidatePageHeader} from '../../../components/ui/CandidatePageHeader';
import {goBackOrReplace} from '../../../core/navigation/go-back-or-replace';

type JobsHeaderProps = {
  containerWidth: number;
};

export function JobsHeader({containerWidth}: JobsHeaderProps) {
  return (
    <CandidatePageHeader
      artworkTestID="jobs-header-artwork"
      backLabel="Kembali ke Beranda"
      containerWidth={containerWidth}
      contentTestID="jobs-header-content"
      onBack={() => goBackOrReplace('/(candidate)/(tabs)/home')}
      subtitle="Temukan peluang yang sesuai untukmu"
      testID="jobs-header-background"
      title="Lowongan Kerja"
      variant="jobs-list"
    />
  );
}
