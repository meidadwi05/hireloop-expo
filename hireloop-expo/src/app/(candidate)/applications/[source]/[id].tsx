import {Redirect, useLocalSearchParams} from 'expo-router';
import React from 'react';

import {ApplicationDetailScreen} from '../../../../features/applications/screens/ApplicationDetailScreen';
import type {CandidateJobSource} from '../../../../features/jobs/jobs.types';

export default function CandidateApplicationDetailRoute() {
  const params = useLocalSearchParams<{source?: string; id?: string; applicationId?: string; complete?: string; interviewStage?: string}>();
  const source: CandidateJobSource | null = params.source === 'job-posting' || params.source === 'project-lowongan'
    ? params.source
    : null;
  const id = Number(params.id);
  const applicantId = Number(params.applicationId);

  if (!source || !Number.isInteger(id) || id <= 0) {
    return <Redirect href="/(candidate)/(tabs)/career" />;
  }

  return (
    <ApplicationDetailScreen
      key={`${source}:${id}:${params.applicationId ?? ''}:${params.complete ?? ''}:${params.interviewStage ?? ''}`}
      source={source}
      id={id}
      applicationId={Number.isInteger(applicantId) && applicantId > 0 ? applicantId : undefined}
      openRequirements={params.complete === '1'}
      interviewStage={params.interviewStage}
    />
  );
}
