import type { WatchlistItem } from "./types";

export function isEmbedItem(item: WatchlistItem): boolean {
	return item.type === "Embed";
}

export function isCountdownItem(item: WatchlistItem): boolean {
	return item.type === "Countdown";
}

export function isSpecialWatchlistItem(item: WatchlistItem): boolean {
	return isEmbedItem(item) || isCountdownItem(item);
}

const ISIN_COMPATIBLE_TYPES = new Set(["Stock", "ETF", "Bond", "Index"]);

export function isIsinCompatible(item: WatchlistItem): boolean {
	return item.type ? ISIN_COMPATIBLE_TYPES.has(item.type) : false;
}
