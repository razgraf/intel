import type { WatchlistItem } from "@/entities/watchlist/model/types";

export const PREVIEW_ITEMS: WatchlistItem[] = [
	{
		ticker: "TSLA",
		label: "Tesla",
		type: "Stock",
		currency: "USD",
	},
	{
		ticker: "^SPX",
		label: "S&P 500",
		type: "Index",
		currency: "USD",
		futuresTicker: "ES=F",
	},
	{
		ticker: "TSLA260618P00190000",
		label: "TSLA Put",
		type: "Option",
		currency: "USD",
	},
	{
		ticker: "ETH_USDC-26JUN26-5000-C",
		label: "ETH 5000C",
		type: "Option",
		currency: "USD",
		source: "deribit",
	},
	{
		ticker: "VWCE.DE",
		label: "VWCE",
		type: "ETF",
		currency: "EUR",
	},
	{
		ticker: "GC=F",
		label: "Gold",
		type: "Future",
		currency: "USD",
	},
	{
		ticker: "ETH-USD",
		label: "Ethereum",
		type: "Crypto",
		currency: "USD",
	},
	{
		ticker: "bloomberg-live",
		label: "Bloomberg Live",
		type: "Embed",
		source: "youtube",
		embed: {
			kind: "youtube",
			url: "https://www.youtube.com/watch?v=iEpJwprxDdk",
		},
	},
];
