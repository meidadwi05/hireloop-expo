export type DashboardInterview = {
  id: number | string;
  date: string;
  agenda: string;
  time: string | null;
  mode: 'online' | 'offline';
  location: string | null;
  meeting_link: string | null;
  role_taxonomy_name: string;
  candidate_name: string;
  company_name?: string | null;
};

export type CandidateDashboard = {
  interviews: DashboardInterview[];
};
