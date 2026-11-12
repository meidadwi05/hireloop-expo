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
  icon: string | null;
  color: string | null;
  histories: RecruitmentProcessHistory[];
  results: RecruitmentProcessResult[];
  schedules: RecruitmentProcessSchedule[];
  offerings: RecruitmentProcessOffering[];
};

export type RecruitmentProcessHistory = {
  id: number;
  actionType: string;
  fromStage: {index: number | null; value: string | null; label: string | null; status: string | null};
  toStage: {index: number | null; value: string | null; label: string | null; status: string | null};
  note: string | null;
  metadata: unknown;
  occurredAt: string | null;
};

export type RecruitmentProcessResult = {
  id: number;
  stageIndex: number | null;
  stageValue: string | null;
  stageLabel: string | null;
  type: string | null;
  executionStatus: string | null;
  status: string | null;
  score: number | null;
  scorecard: unknown;
  note: string | null;
  attachmentPath: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type RecruitmentProcessSchedule = {
  id: number;
  stageIndex: number | null;
  stageValue: string | null;
  stageLabel: string | null;
  type: string | null;
  agenda: string | null;
  date: string | null;
  startTime: string | null;
  endTime: string | null;
  method: string | null;
  locationPlatform: string | null;
  addressLink: string | null;
  addressMapsUrl: string | null;
  sessionId: number | null;
  note: string | null;
  status: string | null;
  rescheduleCount: number;
  medicalResult: string | null;
  cancellationReason: string | null;
  cancellationAfterAction: string | null;
  cancellationNote: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type RecruitmentProcessOffering = {
  id: number;
  status: string | null;
  effectiveDate: string | null;
  note: string | null;
  confirmationSource: string | null;
  createdAt: string | null;
  updatedAt: string | null;
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

export type RequirementUpload = {
  label: string;
  group: 'dokumen' | 'sertifikasi';
  required: boolean;
  uri?: string;
  name?: string;
  mimeType?: string;
  file?: Blob;
};

export type CompleteRequirementsInput = {
  applicationId: number;
  documents: RequirementUpload[];
  familyDeclaration?: unknown;
  statements?: unknown;
  agreed: true;
};
