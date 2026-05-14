import type { WatchlistItem } from "./types";

export function isEmbedItem(item: WatchlistItem): boolean {
	return item.type === "Embed";
}

export function isCountdownItem(item: WatchlistItem): boolean {
	return item.type === "Countdown";
}

export function isTargetsItem(item: WatchlistItem): boolean {
	return item.type === "Targets";
}

export function isSpecialWatchlistItem(item: WatchlistItem): boolean {
	return isEmbedItem(item) || isCountdownItem(item) || isTargetsItem(item);
}

const ISIN_COMPATIBLE_TYPES = new Set(["Stock", "ETF", "Bond", "Index"]);

export function isIsinCompatible(item: WatchlistItem): boolean {
	return item.type ? ISIN_COMPATIBLE_TYPES.has(item.type) : false;
}

const TARGETS_PRICEABLE_TYPES = new Set([
	"Stock",
	"ETF",
	"Index",
	"Crypto",
	"Bond",
	"Future",
	"Option",
]);

export function isPriceableForTargets(item: WatchlistItem): boolean {
	if (!item.type || isSpecialWatchlistItem(item)) return false;
	if (item.source === "deribit") return false;
	return TARGETS_PRICEABLE_TYPES.has(item.type);
}
