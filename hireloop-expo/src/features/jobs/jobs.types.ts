export type CandidateJobSource = 'job-posting' | 'project-lowongan';

export type CandidateJobQuery = {
  search?: string;
  priority?: 'all' | 'high';
  page?: number;
  per_page?: number;
};

export type CandidateJobCard = {
  id: number;
  key: string;
  source: CandidateJobSource;
  title: string;
  company: string;
  location: string;
  contractType: string;
  workMode: string;
  salaryLabel: string;
  urgent: boolean;
  active: boolean;
  skills: string[];
  applicantsCount: number;
  closingDate: string | null;
  publishedAt: string | null;
  updatedAt: string | null;
  closingLabel: string;
  publishedLabel: string;
  updatedLabel: string;
  /** Compatibility aliases used by the existing dashboard card. */
  workType: string;
  salary: string;
};

export type JobCardModel = CandidateJobCard;

export type CandidateJobsPage = {
  items: CandidateJobCard[];
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
  from: number | null;
  to: number | null;
};

export type CandidateJobDetail = CandidateJobCard & {
  description: string;
  requirements: string[];
  benefits: string[];
  education: string;
  experience: string;
};

export type ApplyCandidateJobPayload = {
  job_reference_type: CandidateJobSource;
  job_reference_id: number;
  job_title: string;
  company_name: string;
  location: string;
  agreed: true;
};
