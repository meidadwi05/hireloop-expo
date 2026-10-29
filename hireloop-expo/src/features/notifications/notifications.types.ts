export type NotificationLevel = 'success' | 'info' | 'warning' | 'error';

export type CandidateNotificationMeta = Record<string, unknown> & {
  action_url?: string | null;
  company_name?: string | null;
  job_posting_id?: number | string | null;
  job_reference_id?: number | string | null;
  job_reference_type?: string | null;
  job_title?: string | null;
  lowongan_id?: number | string | null;
  pipeline_id?: number | string | null;
  status?: string | null;
};

export type CandidateNotification = {
  body: string;
  createdAt: string;
  id: string;
  isRead: boolean;
  level: NotificationLevel;
  meta: CandidateNotificationMeta;
  title: string;
  type: string;
};

export type NotificationsPage = {
  currentPage: number;
  items: CandidateNotification[];
  lastPage: number;
  perPage: number;
  total: number;
};

export type NotificationsQuery = {
  page?: number;
  per_page?: number;
};
