import { QueryClient } from '@tanstack/react-query'

// Singleton QueryClient so the axios interceptors and the auth store can
// clear cached data on logout/401, not just components under QueryClientProvider.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      retry: false,
    },
  },
})
