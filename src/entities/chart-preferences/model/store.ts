"use client";

import type { WatchlistItem } from "@/entities/watchlist/model/types";
import type { Timeframe } from "@/shared/lib/constants";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const DERIBIT_TIMEFRAMES: readonly Timeframe[] = ["1D", "1W", "1M"];

interface ChartPreferencesState {
	timeframes: Record<string, Timeframe>;
	setTimeframe: (ticker: string, tf: Timeframe) => void;
	resetAll: (tf: Timeframe, items: WatchlistItem[]) => void;
}

export const useChartPreferencesStore = create<ChartPreferencesState>()(
	persist(
		(set) => ({
			timeframes: {},
			setTimeframe: (ticker, tf) =>
				set((state) => ({
					timeframes: { ...state.timeframes, [ticker]: tf },
				})),
			resetAll: (tf, items) =>
				set(() => {
					const timeframes: Record<string, Timeframe> = {};
					for (const item of items) {
						if (item.embed) continue;
						const isDeribit = item.source === "deribit";
						timeframes[item.ticker] = isDeribit && !DERIBIT_TIMEFRAMES.includes(tf) ? "1D" : tf;
					}
					return { timeframes };
				}),
		}),
		{ name: "intel-chart-preferences" },
	),
);
