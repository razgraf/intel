export const POLYMARKET_GAMMA_BASE = "https://gamma-api.polymarket.com";

export const POLYMARKET_EVENT_URL = (slug: string) =>
	`https://polymarket.com/event/${encodeURIComponent(slug)}`;

export interface PolymarketMarket {
	id: string;
	question: string;
	slug?: string;
	conditionId?: string;
	endDate?: string;
	outcomes?: string[] | string;
	outcomePrices?: string[] | string;
	volume?: number | string;
	volume24hr?: number | string;
	liquidity?: number | string;
	lastTradePrice?: number;
	bestBid?: number;
	bestAsk?: number;
	image?: string;
	icon?: string;
	groupItemTitle?: string;
	closed?: boolean;
	active?: boolean;
}

export interface PolymarketEvent {
	id: string;
	ticker?: string;
	slug: string;
	title: string;
	description?: string;
	image?: string;
	icon?: string;
	liquidity?: number | string;
	volume?: number | string;
	volume24hr?: number | string;
	openInterest?: number | string;
	endDate?: string;
	closed?: boolean;
	active?: boolean;
	markets?: PolymarketMarket[];
	tags?: Array<{ label?: string; slug?: string }>;
}

export interface PolymarketSearchEvent {
	id: string;
	slug: string;
	title: string;
	image?: string;
	icon?: string;
	volume?: number | string;
	volume24hr?: number | string;
	endDate?: string;
	closed?: boolean;
}

/** Parse a possibly-stringified JSON array field returned by Gamma. */
export function parseStringArray(value: unknown): string[] {
	if (Array.isArray(value)) return value.map(String);
	if (typeof value === "string") {
		try {
			const parsed = JSON.parse(value);
			return Array.isArray(parsed) ? parsed.map(String) : [];
		} catch {
			return [];
		}
	}
	return [];
}

export function toNumber(value: unknown): number {
	if (typeof value === "number") return Number.isFinite(value) ? value : 0;
	if (typeof value === "string") {
		const n = Number(value);
		return Number.isFinite(n) ? n : 0;
	}
	return 0;
}
