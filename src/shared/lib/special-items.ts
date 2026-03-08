import type { WatchlistItem } from "@/entities/watchlist/model/types";

export const SPECIAL_ITEMS: WatchlistItem[] = [
	{
		ticker: "bloomberg-live",
		label: "Bloomberg Live",
		type: "Embed",
		embed: { kind: "youtube", url: "https://www.youtube.com/watch?v=iEpJwprxDdk" },
	},
];
