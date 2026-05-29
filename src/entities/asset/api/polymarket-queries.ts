"use client";

import { apiFetch } from "@/shared/lib/api";
import { POLL_INTERVAL } from "@/shared/lib/constants";
import type { PolymarketEvent, PolymarketSearchEvent } from "@/shared/lib/polymarket";
import { useQuery } from "@tanstack/react-query";

export function usePolymarketSearch(query: string) {
	return useQuery<PolymarketSearchEvent[]>({
		queryKey: ["polymarket-search", query],
		queryFn: () => apiFetch("/api/polymarket/search", { q: query }),
		enabled: query.length >= 1,
		staleTime: 30_000,
	});
}

export function usePolymarketPreview(enabled: boolean) {
	return useQuery<PolymarketSearchEvent[]>({
		queryKey: ["polymarket-preview"],
		queryFn: () => apiFetch("/api/polymarket/search", { preview: "1" }),
		enabled,
		staleTime: 5 * 60_000,
	});
}

export function usePolymarketEvent(slug: string | undefined) {
	return useQuery<PolymarketEvent | null>({
		queryKey: ["polymarket-event", slug],
		queryFn: async () => {
			try {
				return await apiFetch<PolymarketEvent | null>("/api/polymarket/event", {
					slug: slug as string,
				});
			} catch (err) {
				if (err instanceof Error && err.message.includes("404")) return null;
				throw err;
			}
		},
		enabled: !!slug,
		refetchInterval: POLL_INTERVAL,
		refetchIntervalInBackground: false,
		staleTime: 30_000,
	});
}
