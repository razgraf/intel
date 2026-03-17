"use client";

import { apiFetch } from "@/shared/lib/api";
import { POLL_INTERVAL } from "@/shared/lib/constants";
import { useQuery } from "@tanstack/react-query";
import type { DeribitQuote } from "../model/deribit-types";
import type { HistoricalPoint, SearchResult } from "../model/types";

export type DeribitTimeframe = "1D" | "1W" | "1M";

export function useDeribitSearch(query: string) {
	return useQuery<SearchResult[]>({
		queryKey: ["deribit-search", query],
		queryFn: () => apiFetch("/api/deribit/search", { q: query }),
		enabled: query.length >= 1,
		staleTime: 30_000,
	});
}

export function useDeribitPreview(enabled: boolean) {
	return useQuery<SearchResult[]>({
		queryKey: ["deribit-preview"],
		queryFn: () => apiFetch("/api/deribit/search", { preview: "1" }),
		enabled,
		staleTime: 5 * 60_000,
	});
}

export function useDeribitQuotes(symbols: string[]) {
	const key = [...symbols].sort().join(",");
	return useQuery<DeribitQuote[]>({
		queryKey: ["deribit-quotes", key],
		queryFn: () => apiFetch("/api/deribit/quote", { symbols: symbols.join(",") }),
		enabled: symbols.length > 0,
		refetchInterval: POLL_INTERVAL,
	});
}

export function useDeribitChart(symbol: string | undefined, timeframe: DeribitTimeframe) {
	return useQuery<HistoricalPoint[]>({
		queryKey: ["deribit-chart", symbol, timeframe],
		queryFn: () => apiFetch("/api/deribit/history", { symbol: symbol as string, range: timeframe }),
		enabled: !!symbol,
		staleTime: 60_000,
	});
}
