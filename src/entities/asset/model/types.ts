import type { AssetType } from "@/shared/lib/constants";

export interface Quote {
	symbol: string;
	shortName: string;
	regularMarketPrice: number;
	regularMarketChange: number;
	regularMarketChangePercent: number;
	regularMarketPreviousClose: number;
	regularMarketOpen: number;
	regularMarketDayHigh: number;
	regularMarketDayLow: number;
	regularMarketVolume: number;
	currency: string;
	marketState: string;
	exchange: string;
	quoteType: string;
}

export interface HistoricalPoint {
	time: number;
	value: number;
}

export interface CandlePoint {
	time: number;
	open: number;
	high: number;
	low: number;
	close: number;
}

export interface SearchResult {
	symbol: string;
	shortname: string;
	exchange: string;
	quoteType: string;
}

export interface OptionsChain {
	expirationDates: number[];
	strikes: number[];
	calls: OptionContract[];
	puts: OptionContract[];
}

export interface OptionContract {
	strike: number;
	expiration: string;
	lastPrice: number;
	bid: number;
	ask: number;
	volume: number;
	openInterest: number;
	impliedVolatility: number;
}

export interface EarningsEvent {
	symbol: string;
	date: string; // YYYY-MM-DD, earliest day in window
	endDate?: string; // YYYY-MM-DD, latest day if Yahoo returns a 2-day window
	epsEstimate: number | null;
	hour: "bmo" | "amc" | "dmh" | "";
}

export function inferAssetType(quoteType: string): AssetType {
	switch (quoteType?.toUpperCase()) {
		case "EQUITY":
			return "Stock";
		case "ETF":
			return "ETF";
		case "CRYPTOCURRENCY":
			return "Crypto";
		case "FUTURE":
			return "Future";
		case "OPTION":
			return "Option";
		case "INDEX":
			return "Index";
		case "MUTUALFUND":
			return "Bond";
		default:
			return "Stock";
	}
}
