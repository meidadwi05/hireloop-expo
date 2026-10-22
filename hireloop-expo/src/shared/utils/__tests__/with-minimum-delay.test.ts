import {withMinimumDelay} from '../with-minimum-delay';

describe('withMinimumDelay', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  test('menahan hasil sampai durasi minimum tercapai', async () => {
    const promise = withMinimumDelay(async () => 'selesai', 2000);
    let settled = false;
    void promise.then(() => { settled = true; });

    await jest.advanceTimersByTimeAsync(1999);
    expect(settled).toBe(false);

    await jest.advanceTimersByTimeAsync(1);
    await expect(promise).resolves.toBe('selesai');
  });

  test('tetap meneruskan error setelah durasi minimum', async () => {
    const promise = withMinimumDelay(async () => {
      throw new Error('gagal');
    }, 2000);
    const expectation = expect(promise).rejects.toThrow('gagal');

    await jest.advanceTimersByTimeAsync(2000);
    await expectation;
  });
});
