import {shouldAttemptTokenRefresh} from '../http-refresh-policy';

describe('shouldAttemptTokenRefresh', () => {
  const protectedRequest = {
    hasRequest: true,
    retried: false,
    status: 401,
    url: '/user/dashboard',
  };

  it.each([
    '/login',
    '/register',
    '/verify-otp',
    '/resend-otp',
    '/forgot-password',
    '/reset-password',
    '/google/mobile/redirect',
    '/google/mobile/exchange',
    'https://hireloop.superapp-provenforceindonesia.com/api/login',
  ])('does not refresh a public authentication request: %s', url => {
    expect(shouldAttemptTokenRefresh({...protectedRequest, url})).toBe(false);
  });

  it('does not recursively refresh the refresh endpoint', () => {
    expect(shouldAttemptTokenRefresh({...protectedRequest, url: '/auth/refresh'})).toBe(false);
  });

  it('preserves the original authentication error from the current-user endpoint', () => {
    expect(shouldAttemptTokenRefresh({...protectedRequest, url: '/auth/me'})).toBe(false);
    expect(shouldAttemptTokenRefresh({
      ...protectedRequest,
      url: 'https://hireloop.superapp-provenforceindonesia.com/api/auth/me',
    })).toBe(false);
  });

  it('refreshes a protected endpoint after its first 401 response', () => {
    expect(shouldAttemptTokenRefresh(protectedRequest)).toBe(true);
  });

  it('does not refresh a request that has already been retried', () => {
    expect(shouldAttemptTokenRefresh({...protectedRequest, retried: true})).toBe(false);
  });

  it('does not refresh non-401 responses or errors without a request config', () => {
    expect(shouldAttemptTokenRefresh({...protectedRequest, status: 403})).toBe(false);
    expect(shouldAttemptTokenRefresh({...protectedRequest, hasRequest: false})).toBe(false);
  });
});
