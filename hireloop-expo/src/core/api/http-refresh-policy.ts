const PUBLIC_AUTH_PATHS = new Set([
  '/login',
  '/register',
  '/verify-otp',
  '/resend-otp',
  '/forgot-password',
  '/reset-password',
]);

type RefreshDecisionInput = {
  hasRequest: boolean;
  retried: boolean;
  status?: number;
  url?: string;
};

function getApiRelativePath(url?: string): string {
  if (!url) return '';

  try {
    const pathname = new URL(url, 'https://hireloop.invalid').pathname;
    return pathname.startsWith('/api/') ? pathname.slice('/api'.length) : pathname;
  } catch {
    return url.split('?')[0] ?? '';
  }
}

export function shouldAttemptTokenRefresh({
  hasRequest,
  retried,
  status,
  url,
}: RefreshDecisionInput): boolean {
  if (status !== 401 || !hasRequest || retried) return false;

  const path = getApiRelativePath(url);
  return path !== '/auth/refresh' && !PUBLIC_AUTH_PATHS.has(path);
}
