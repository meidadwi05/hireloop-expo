import type {CandidateJobDetail, CandidateJobSource} from '../jobs/jobs.types';

export type ApplicationStorageKind = 'applicant-data' | 'legacy-job-applicant';
export type ApplicationUiState =
  | 'applied'
  | 'in-progress'
  | 'hired'
  | 'rejected'
  | 'canceled'
  | 'closed'
  | 'temporary'
  | 'transferred';

export type ApplicationStage = {
  index: number;
  value: string;
  label: string;
  type: string | null;
  status: string;
  isCurrent: boolean;
  isCompleted: boolean;
  startedAt: string | null;
  completedAt: string | null;
  note: string | null;
};

export type CandidateApplication = {
  applicationId: number;
  source: CandidateJobSource;
  referenceId: number;
  storageKind: ApplicationStorageKind;
  title: string;
  company: string;
  location: string;
  applicationStatus: string;
  stageStatus: string;
  currentStageIndex: number;
  currentStageValue: string;
  currentStageLabel: string;
  stages: ApplicationStage[];
  state: ApplicationUiState;
  submittedAt: string | null;
  updatedAt: string | null;
  canceledAt: string | null;
  isTemporary: boolean;
  isTransferred: boolean;
  transferNote: string | null;
};

export type RecruitmentProcess = {
  applicationId: number;
  currentStage: {
    index: number;
    value: string;
    label: string;
    status: string;
  };
  finalDecision: {
    value: 'hired' | 'rejected';
    label: string;
    status: string;
    note: string | null;
    decidedAt: string | null;
  } | null;
  stages: ApplicationStage[];
};

export type ApplicationCardModel = {
  key: string;
  application: CandidateApplication | null;
  job: CandidateJobDetail;
  savedOnly: boolean;
};

export type CancelApplicationInput = {
  applicationId: number;
  storageKind: ApplicationStorageKind;
};
