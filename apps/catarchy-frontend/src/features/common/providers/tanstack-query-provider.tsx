import { EdenFetchError } from "@elysiajs/eden";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry(failureCount, error) {
        if (error instanceof EdenFetchError) {
          return false;
        }

        return failureCount < 3;
      },
      // 5 seconds
      staleTime: 5 * 1000,
    },
  },
});

export function TanstackQueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
