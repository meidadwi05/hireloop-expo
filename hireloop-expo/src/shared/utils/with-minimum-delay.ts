export const MIN_ACTION_LOADING_MS = 2000;

export function wait(milliseconds: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

export async function withMinimumDelay<T>(
  operation: () => Promise<T> | T,
  minimumMilliseconds = MIN_ACTION_LOADING_MS,
): Promise<T> {
  const startedAt = Date.now();

  try {
    return await operation();
  } finally {
    const remaining = minimumMilliseconds - (Date.now() - startedAt);
    if (remaining > 0) await wait(remaining);
  }
}
