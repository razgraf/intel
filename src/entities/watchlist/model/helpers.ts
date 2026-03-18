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
