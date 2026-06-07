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
	preMarketPrice?: number;
	preMarketChange?: number;
	preMarketChangePercent?: number;
	postMarketPrice?: number;
	postMarketChange?: number;
	postMarketChangePercent?: number;
	marketCap?: number;
}

export interface ExtendedHours {
	label: string;
	price: number;
	changePercent?: number;
}

/**
 * Resolve the active extended-hours session (pre-market or after-hours/overnight)
 * for a quote, if any. Yahoo's marketState cycles PRE/PREPRE → REGULAR → POST/POSTPOST
 * → CLOSED. When a session ends (evenings, weekends) the state flips to CLOSED but the
 * last extended-hours print is kept in pre/postMarketPrice — so we surface whichever
 * field Yahoo populated rather than gating strictly on the live session.
 */
export function getExtendedHours(quote: Quote | null | undefined): ExtendedHours | null {
	if (!quote) return null;
	const state = quote.marketState ?? "";
	if (state.startsWith("PRE") && quote.preMarketPrice) {
		return {
			label: "Pre-Market",
			price: quote.preMarketPrice,
			changePercent: quote.preMarketChangePercent,
		};
	}
	// POST/POSTPOST is the live after-hours session; CLOSED carries the last print.
	if ((state.startsWith("POST") || state === "CLOSED") && quote.postMarketPrice) {
		return {
			label: "After Hours",
			price: quote.postMarketPrice,
			changePercent: quote.postMarketChangePercent,
		};
	}
	return null;
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
