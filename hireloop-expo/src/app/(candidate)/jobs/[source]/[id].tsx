import {Redirect, useLocalSearchParams} from 'expo-router';
import React from 'react';

import {JobDetailScreen} from '../../../../features/jobs/components/JobDetailScreen';
import type {CandidateJobSource} from '../../../../features/jobs/jobs.types';

export default function CandidateJobDetailRoute() {
  const params = useLocalSearchParams<{source?: string; id?: string; intent?: string}>();
  const source: CandidateJobSource | null = params.source === 'job-posting' || params.source === 'project-lowongan'
    ? params.source
    : null;
  const id = Number(params.id);

  if (!source || !Number.isInteger(id) || id <= 0) {
    return <Redirect href="/(candidate)/(tabs)/jobs" />;
  }

  return <JobDetailScreen source={source} id={id} autoOpenApply={params.intent === 'apply'} />;
}
