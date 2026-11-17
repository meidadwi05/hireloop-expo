import {useLocalSearchParams} from 'expo-router';
import React from 'react';

import {PerformanceDetailScreen} from '../../../features/performance/screens/PerformanceDetailScreen';

export default function PerformanceDetailRoute() {
  const {contractId} = useLocalSearchParams<{contractId: string}>();
  return <PerformanceDetailScreen contractId={contractId ?? ''} />;
}

