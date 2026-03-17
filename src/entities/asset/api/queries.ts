"use client";

import { apiFetch } from "@/shared/lib/api";
import { POLL_INTERVAL, TIMEFRAME_INTERVALS, type Timeframe } from "@/shared/lib/constants";
import { useQuery } from "@tanstack/react-query";
import type {
	EarningsEvent,
	HistoricalPoint,
	OptionsChain,
	Quote,
	SearchResult,
} from "../model/types";

export function useQuotes(symbols: string[]) {
	const key = [...symbols].sort().join(",");
	return useQuery<Quote[]>({
		queryKey: ["quotes", key],
		queryFn: () => apiFetch("/api/market/quote", { symbols: symbols.join(",") }),
		enabled: symbols.length > 0,
		refetchInterval: POLL_INTERVAL,
	});
}

export function useChart(symbol: string | undefined, timeframe: Timeframe) {
	const { range, interval } = TIMEFRAME_INTERVALS[timeframe];
	return useQuery<HistoricalPoint[]>({
		queryKey: ["chart", symbol, timeframe],
		queryFn: () => apiFetch("/api/market/history", { symbol: symbol!, range, interval }),
		enabled: !!symbol,
		staleTime: 60_000,
	});
}

export function useSearch(query: string) {
	return useQuery<SearchResult[]>({
		queryKey: ["search", query],
		queryFn: () => apiFetch("/api/market/search", { q: query }),
		enabled: query.length >= 1,
		staleTime: 30_000,
	});
}

export function useOptions(symbol: string | undefined) {
	return useQuery<OptionsChain>({
		queryKey: ["options", symbol],
		queryFn: () => apiFetch("/api/market/options", { symbol: symbol! }),
		enabled: !!symbol,
		staleTime: 120_000,
	});
}

export function useEarnings(symbols: string[]) {
	const key = [...symbols].sort().join(",");
	return useQuery<EarningsEvent[]>({
		queryKey: ["earnings", key],
		queryFn: () => apiFetch("/api/market/earnings", { symbols: symbols.join(",") }),
		enabled: symbols.length > 0,
		staleTime: 6 * 60 * 60 * 1000, // 6 hours
	});
}
