import type { WatchlistItem } from "@/entities/watchlist/model/types";

export interface EncodedPayload {
	watchlist: WatchlistItem[];
	isins: Record<string, string>;
}

export function encodeWatchlist(
	items: WatchlistItem[],
	isins: Record<string, string> = {},
): string {
	const payload: EncodedPayload = { watchlist: items, isins };
	const json = JSON.stringify(payload);
	const base64 = btoa(json).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
	return base64;
}

function normalizeItems(items: unknown[]): WatchlistItem[] | null {
	for (const item of items) {
		if (
			typeof (item as { ticker?: unknown })?.ticker !== "string" ||
			!(item as { ticker: string }).ticker
		) {
			return null;
		}
	}
	for (const item of items as WatchlistItem[]) {
		if (item.type === "Embed" && !item.source) {
			item.source = "youtube";
		}
		if (item.type === "Countdown" && !item.source) {
			item.source = "countdown";
		}
		if (item.type === "Polymarket" && !item.source) {
			item.source = "polymarket";
		}
	}
	return items as WatchlistItem[];
}

function isIsinShape(value: unknown): value is Record<string, string> {
	if (!value || typeof value !== "object" || Array.isArray(value)) return false;
	for (const [k, v] of Object.entries(value)) {
		if (typeof k !== "string" || typeof v !== "string") return false;
	}
	return true;
}

export function decodeWatchlist(payload: string): EncodedPayload | null {
	try {
		const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
		const json = atob(base64);
		const parsed: unknown = JSON.parse(json);

		// Legacy array shape — wrap as { watchlist, isins: {} }.
		if (Array.isArray(parsed)) {
			const items = normalizeItems(parsed);
			if (!items) return null;
			return { watchlist: items, isins: {} };
		}

		// New object shape.
		if (parsed && typeof parsed === "object") {
			const rawList = (parsed as { watchlist?: unknown }).watchlist;
			if (!Array.isArray(rawList)) return null;
			const items = normalizeItems(rawList);
			if (!items) return null;

			const rawIsins = (parsed as { isins?: unknown }).isins;
			const isins = isIsinShape(rawIsins) ? rawIsins : {};

			return { watchlist: items, isins };
		}

		return null;
	} catch {
		return null;
	}
}
