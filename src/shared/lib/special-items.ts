import type { WatchlistItem } from "@/entities/watchlist/model/types";

export const SPECIAL_ITEMS: WatchlistItem[] = [
	{
		ticker: "bloomberg-live",
		label: "Bloomberg Live",
		type: "Embed",
		source: "youtube",
		embed: { kind: "youtube", url: "https://www.youtube.com/watch?v=iEpJwprxDdk" },
	},
	{
		ticker: "yahoo-finance-live",
		label: "Yahoo Finance Live",
		type: "Embed",
		source: "youtube",
		embed: { kind: "youtube", url: "https://www.youtube.com/watch?v=KQp-e_XQnDE" },
	},
];
