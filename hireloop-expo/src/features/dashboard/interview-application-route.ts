import {router, type Href} from 'expo-router';

import type {DashboardInterview} from './dashboard.types';

export function interviewApplicationHref(interview: DashboardInterview): Href | null {
  const source = interview.job_reference_type;
  const id = Number(interview.job_reference_id);

  if ((source !== 'job-posting' && source !== 'project-lowongan') || !Number.isFinite(id) || id <= 0) {
    return null;
  }

  return {
    pathname: '/(candidate)/applications/[source]/[id]',
    params: {source, id: String(id)},
  };
}

export function openInterviewApplication(interview: DashboardInterview) {
  const href = interviewApplicationHref(interview);
  if (!href) return false;

  router.push(href);
  return true;
}
