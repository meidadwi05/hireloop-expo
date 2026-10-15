import {QueryClient} from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: failureCount => failureCount < 2,
      refetchOnWindowFocus: false,
    },
    mutations: {retry: false},
  },
});
