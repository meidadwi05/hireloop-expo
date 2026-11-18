import React from 'react';

import {CandidatePageHeader} from '../../../components/ui/CandidatePageHeader';
import {goBackOrReplace} from '../../../core/navigation/go-back-or-replace';

type PerformanceHeaderProps = {
  containerWidth: number;
  detail?: boolean;
  subtitle?: string;
  title?: string;
};

export function PerformanceHeader({containerWidth, detail = false, subtitle, title}: PerformanceHeaderProps) {
  return (
    <CandidatePageHeader
      containerWidth={containerWidth}
      onBack={() => goBackOrReplace(detail ? '/(candidate)/performance' : '/(candidate)/(tabs)/home')}
      subtitle={subtitle ?? (detail ? 'Detail penilaian KPI dan evaluasi kinerja Anda' : 'Ringkasan penilaian KPI dan evaluasi kinerja Anda')}
      title={title ?? (detail ? 'Hasil Penilaian Performance' : 'Performance')}
      variant="performance"
    />
  );
}

