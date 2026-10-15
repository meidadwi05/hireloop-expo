export type CandidateJobQuery = {
  search?: string;
  priority?: 'all' | 'high';
  page?: number;
  per_page?: number;
};

export type JobCardModel = {
  id: string;
  source: string;
  title: string;
  company: string;
  location: string;
  workType: string;
  salary: string;
  urgent: boolean;
  skills: string[];
  publishedLabel: string;
  updatedLabel: string;
};
