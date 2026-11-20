import type {CandidateApplication} from './applications.types';

export function applicationDetailRoute(application: CandidateApplication, openRequirements = false) {
  return {
    pathname: '/(candidate)/applications/[source]/[id]' as const,
    params: {
      source: application.source,
      id: String(application.referenceId),
      applicationId: String(application.applicationId),
      ...(openRequirements ? {complete: '1'} : {}),
    },
  };
}
