import {httpClient} from '../../../core/api/http-client';
import {tokenStorage} from '../../../api/tokenStorage';
import {authApi} from '../api/auth.api';
import {AuthFlowError} from '../auth.errors';

jest.mock('../../../core/api/http-client', () => ({
  httpClient: {get: jest.fn(), post: jest.fn()},
}));

jest.mock('../../../api/tokenStorage', () => ({
  tokenStorage: {
    get: jest.fn(),
    set: jest.fn(),
    replace: jest.fn(),
    remove: jest.fn(),
  },
}));

const candidate = {
  id: 1,
  full_name: 'Andi Kandidat',
  email: 'andi@example.com',
  is_verified: true,
  prod_candidate: false,
  onboarding_finished: true,
  role: 'user',
  roles: ['user'],
};

describe('authApi', () => {
  const post = jest.mocked(httpClient.post);
  const get = jest.mocked(httpClient.get);
  const setToken = jest.mocked(tokenStorage.set);
  const removeToken = jest.mocked(tokenStorage.remove);

  beforeEach(() => {
    jest.clearAllMocks();
    setToken.mockResolvedValue();
    removeToken.mockResolvedValue();
  });

  it('stores the token, verifies /auth/me, and returns a candidate', async () => {
    post.mockResolvedValue({data: {success: true, token: 'candidate-token'}});
    get.mockResolvedValue({data: {success: true, data: candidate}});

    await expect(authApi.login({
      email: ' ANDI@EXAMPLE.COM ',
      password: 'secret',
      remember: true,
    })).resolves.toMatchObject({email: 'andi@example.com', roles: ['user']});

    expect(post).toHaveBeenCalledWith('/login', {
      email: 'andi@example.com',
      password: 'secret',
      client_type: 'mobile',
    });
    expect(setToken).toHaveBeenCalledWith('candidate-token', true);
    expect(get).toHaveBeenCalledWith('/auth/me');
    expect(removeToken).not.toHaveBeenCalled();
  });

  it('identifies a failure from /login without storing a token', async () => {
    post.mockRejectedValue(new Error('invalid credentials'));

    await expect(authApi.login({
      email: 'andi@example.com',
      password: 'wrong',
      remember: true,
    })).rejects.toMatchObject({stage: 'login'} satisfies Partial<AuthFlowError>);
    expect(setToken).not.toHaveBeenCalled();
  });

  it('removes the token and identifies a failure from /auth/me', async () => {
    post.mockResolvedValue({data: {success: true, token: 'candidate-token'}});
    get.mockRejectedValue(new Error('unauthenticated'));

    await expect(authApi.login({
      email: 'andi@example.com',
      password: 'secret',
      remember: false,
    })).rejects.toMatchObject({stage: 'current-user'} satisfies Partial<AuthFlowError>);
    expect(removeToken).toHaveBeenCalledTimes(1);
  });

  it('rejects an authenticated account without the candidate role', async () => {
    post.mockResolvedValue({data: {success: true, token: 'candidate-token'}});
    get.mockResolvedValue({
      data: {success: true, data: {...candidate, role: 'HRD', roles: ['HRD']}},
    });

    await expect(authApi.login({
      email: 'hrd@example.com',
      password: 'secret',
      remember: true,
    })).rejects.toMatchObject({stage: 'candidate-role'} satisfies Partial<AuthFlowError>);
    expect(removeToken).toHaveBeenCalledTimes(1);
  });

  it('marks OTP-created sessions as mobile', async () => {
    post.mockResolvedValue({data: {success: true, token: 'registration-token'}});

    await authApi.verifyRegistrationOtp(' ANDI@EXAMPLE.COM ', ' 123456 ');

    expect(post).toHaveBeenCalledWith('/verify-otp', {
      email: 'andi@example.com',
      code: '123456',
      client_type: 'mobile',
    });
    expect(setToken).toHaveBeenCalledWith('registration-token', true);
  });
});
