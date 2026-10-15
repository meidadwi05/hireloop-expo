import {currentUserResponseSchema} from '../auth.schemas';

describe('currentUserResponseSchema', () => {
  it('normalizes optional candidate fields', () => {
    const result = currentUserResponseSchema.parse({
      success: true,
      data: {
        id: 1,
        full_name: 'Andi Pratama',
        email: 'andi@example.com',
        is_verified: true,
        prod_candidate: false,
        onboarding_finished: true,
        role: 'user',
        roles: ['user'],
      },
    });

    expect(result.data.avatar_url).toBeNull();
    expect(result.data.job_applications).toEqual([]);
  });

  it('rejects a user without valid candidate roles data', () => {
    expect(() => currentUserResponseSchema.parse({success: true, data: {id: 1}})).toThrow();
  });
});
