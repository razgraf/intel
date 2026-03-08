"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";

export function QueryProvider({ children }: { children: ReactNode }) {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						staleTime: 15_000,
						gcTime: 10 * 60 * 1000,
						refetchOnWindowFocus: false,
						retry: 2,
						retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30_000),
					},
				},
			}),
	);

	return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
