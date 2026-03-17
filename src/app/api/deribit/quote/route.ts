import type { DeribitQuote } from "@/entities/asset/model/deribit-types";
import { deribitFetch } from "@/shared/lib/deribit";
import { NextResponse } from "next/server";

interface DeribitTickerResult {
	mark_price: number;
	best_bid_price: number;
	best_ask_price: number;
	mark_iv: number;
	underlying_price: number;
	open_interest: number;
	state: string;
	instrument_name: string;
}

const CACHE_TTL = 15_000; // 15s
const quoteCache = new Map<string, { data: DeribitQuote; ts: number }>();

async function fetchQuoteCached(symbol: string): Promise<DeribitQuote> {
	const cached = quoteCache.get(symbol);
	if (cached && Date.now() - cached.ts < CACHE_TTL) {
		return cached.data;
	}

	const ticker = await deribitFetch<DeribitTickerResult>("ticker", {
		instrument_name: symbol,
	});

	const quote: DeribitQuote = {
		symbol: ticker.instrument_name,
		shortName: ticker.instrument_name,
		markPrice: ticker.mark_price,
		bestBid: ticker.best_bid_price,
		bestAsk: ticker.best_ask_price,
		markIV: ticker.mark_iv,
		underlyingPrice: ticker.underlying_price,
		openInterest: ticker.open_interest,
		state: ticker.state,
	};

	quoteCache.set(symbol, { data: quote, ts: Date.now() });
	return quote;
}

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const symbols = searchParams.get("symbols");

	if (!symbols) {
		return NextResponse.json({ error: "Missing symbols parameter" }, { status: 400 });
	}

	const tickers = symbols.split(",").filter(Boolean);

	try {
		const results = await Promise.allSettled(tickers.map((t) => fetchQuoteCached(t)));

		const quotes = results
			.map((r, i) => {
				if (r.status === "fulfilled") return r.value;
				console.error(`Failed to fetch Deribit quote for ${tickers[i]}:`, r.reason);
				return null;
			})
			.filter(Boolean);

		return NextResponse.json(quotes);
	} catch (error) {
		console.error("Deribit quote error:", error);
		return NextResponse.json([], { status: 500 });
	}
}
