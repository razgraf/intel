"use client";

import { useIsinsStore } from "@/entities/isins/model/store";
import { useWatchlistStore } from "@/entities/watchlist/model/store";
import type { WatchlistItem } from "@/entities/watchlist/model/types";

/**
 * Master-list lookup with legacy fallback to item.isin. Used in display layer.
 * Master always wins so explicit removals via the master dialog stick even
 * when the legacy field still exists on the item.
 */
export function useEffectiveIsin(ticker: string): string | undefined {
	const master = useIsinsStore((s) => s.isins[ticker]);
	const legacy = useWatchlistStore((s) => s.items.find((i) => i.ticker === ticker)?.isin);
	return master ?? legacy;
}

/**
 * Project legacy item.isin values into a master-list snapshot. Used at write
 * time to assemble the new schema before pushing to cloud / URL.
 */
export function getEffectiveIsins(
	items: WatchlistItem[],
	master: Record<string, string>,
): Record<string, string> {
	const out: Record<string, string> = { ...master };
	for (const item of items) {
		if (item.isin && !out[item.ticker]) {
			out[item.ticker] = item.isin;
		}
	}
	return out;
}
