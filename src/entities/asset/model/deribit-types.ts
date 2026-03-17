export interface DeribitInstrument {
	instrument_name: string;
	base_currency: string;
	quote_currency: string;
	settlement_currency: string;
	option_type: "call" | "put";
	strike: number;
	expiration_timestamp: number;
}

export interface DeribitQuote {
	symbol: string;
	shortName: string;
	markPrice: number;
	bestBid: number;
	bestAsk: number;
	markIV: number;
	underlyingPrice: number;
	openInterest: number;
	state: string;
}
