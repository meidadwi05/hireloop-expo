export type DashboardInterview = {
  id: number | string;
  session_id?: number | string | null;
  date: string;
  agenda: string;
  time: string | null;
  start_time?: string | null;
  end_time?: string | null;
  mode: 'online' | 'offline';
  method?: string | null;
  location: string | null;
  location_platform?: string | null;
  meeting_link: string | null;
  address_link?: string | null;
  address_maps_url?: string | null;
  note?: string | null;
  role_taxonomy_name: string;
  candidate_name: string;
  company_name?: string | null;
  lowongan_name?: string | null;
  project_name?: string | null;
  stage_name?: string | null;
  interview_type?: string | null;
  category?: string | null;
  schedule_status?: string | null;
  pic_name?: string | null;
};

export type CandidateDashboard = {
  interviews: DashboardInterview[];
};
