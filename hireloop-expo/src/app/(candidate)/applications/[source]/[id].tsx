import {Redirect, useLocalSearchParams} from 'expo-router';
import React from 'react';

import {ApplicationDetailScreen} from '../../../../features/applications/screens/ApplicationDetailScreen';
import type {CandidateJobSource} from '../../../../features/jobs/jobs.types';

export default function CandidateApplicationDetailRoute() {
  const params = useLocalSearchParams<{source?: string; id?: string}>();
  const source: CandidateJobSource | null = params.source === 'job-posting' || params.source === 'project-lowongan'
    ? params.source
    : null;
  const id = Number(params.id);

  if (!source || !Number.isInteger(id) || id <= 0) {
    return <Redirect href="/(candidate)/(tabs)/career" />;
  }

  return <ApplicationDetailScreen source={source} id={id} />;
}
