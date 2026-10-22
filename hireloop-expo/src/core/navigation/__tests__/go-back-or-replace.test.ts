import {router} from 'expo-router';

import {goBackOrReplace} from '../go-back-or-replace';

jest.mock('expo-router', () => ({
  router: {
    back: jest.fn(),
    canGoBack: jest.fn(),
    replace: jest.fn(),
  },
}));

const mockedRouter = router as jest.Mocked<typeof router>;

describe('goBackOrReplace', () => {
  beforeEach(() => jest.clearAllMocks());

  it('kembali ketika navigator memiliki history', () => {
    mockedRouter.canGoBack.mockReturnValue(true);

    goBackOrReplace('/(public)/login');

    expect(mockedRouter.back).toHaveBeenCalledTimes(1);
    expect(mockedRouter.replace).not.toHaveBeenCalled();
  });

  it('mengganti route ketika halaman tidak memiliki history', () => {
    mockedRouter.canGoBack.mockReturnValue(false);

    goBackOrReplace('/(public)/login');

    expect(mockedRouter.back).not.toHaveBeenCalled();
    expect(mockedRouter.replace).toHaveBeenCalledWith('/(public)/login');
  });
});
