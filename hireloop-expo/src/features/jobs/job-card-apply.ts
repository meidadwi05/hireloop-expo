import type {CandidateApplication} from '../applications/applications.types';

export function getAppliedJobKeys(applications: readonly CandidateApplication[]): Set<string> {
  const keys = new Set<string>();
  for (const application of applications) {
    if (application.state !== 'canceled') keys.add(`${application.source}:${application.referenceId}`);
  }
  return keys;
}

export function getJobCardApplyState(applied: boolean, blocked: boolean) {
  if (applied) {
    return {label: 'Sudah Dilamar', accessibilityLabel: 'Sudah Dilamar', colors: ['#667085', '#475467'] as const, blocked: false};
  }
  if (blocked) {
    return {label: 'Akun Terblokir', accessibilityLabel: 'Akun terblokir untuk melamar', colors: ['#E33B5B', '#C81E43'] as const, blocked: true};
  }
  return {label: 'Lamar sekarang', accessibilityLabel: 'Lamar sekarang', colors: ['#0865FF', '#003F9F'] as const, blocked: false};
}
