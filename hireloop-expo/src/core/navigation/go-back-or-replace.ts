import {router} from 'expo-router';

type FallbackRoute = Parameters<typeof router.replace>[0];

export function goBackOrReplace(fallback: FallbackRoute): void {
  if (router.canGoBack()) {
    router.back();
    return;
  }

  router.replace(fallback);
}
