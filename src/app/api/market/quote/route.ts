import { NextResponse } from "next/server";
import yahooFinance, { withTimeout } from "@/shared/lib/yahoo";

interface YFQuote {
	symbol: string;
	shortName?: string;
	regularMarketPrice?: number;
	regularMarketChange?: number;
	regularMarketChangePercent?: number;
	regularMarketPreviousClose?: number;
	regularMarketOpen?: number;
	regularMarketDayHigh?: number;
	regularMarketDayLow?: number;
	regularMarketVolume?: number;
	currency?: string;
	marketState?: string;
	exchange?: string;
	quoteType?: string;
}

const CACHE_TTL = 30_000; // 30s
const quoteCache = new Map<string, { data: YFQuote; ts: number }>();

async function fetchQuoteCached(symbol: string): Promise<YFQuote> {
	const cached = quoteCache.get(symbol);
	if (cached && Date.now() - cached.ts < CACHE_TTL) {
		return cached.data;
	}
	const data = (await withTimeout(yahooFinance.quote(symbol))) as YFQuote;
	quoteCache.set(symbol, { data, ts: Date.now() });
	return data;
}

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const symbols = searchParams.get("symbols");

	if (!symbols) {
		return NextResponse.json({ error: "Missing symbols parameter" }, { status: 400 });
	}

	const tickers = symbols.split(",").filter(Boolean);

	try {
		const results = await Promise.allSettled(
			tickers.map((t) => fetchQuoteCached(t)),
		);

		const quotes = results
			.map((r, i) => {
				if (r.status === "fulfilled" && r.value) {
					const q = r.value;
					return {
						symbol: q.symbol,
						shortName: q.shortName ?? q.symbol,
						regularMarketPrice: q.regularMarketPrice ?? 0,
						regularMarketChange: q.regularMarketChange ?? 0,
						regularMarketChangePercent: q.regularMarketChangePercent ?? 0,
						regularMarketPreviousClose: q.regularMarketPreviousClose ?? 0,
						regularMarketOpen: q.regularMarketOpen ?? 0,
						regularMarketDayHigh: q.regularMarketDayHigh ?? 0,
						regularMarketDayLow: q.regularMarketDayLow ?? 0,
						regularMarketVolume: q.regularMarketVolume ?? 0,
						currency: q.currency ?? "USD",
						marketState: q.marketState ?? "CLOSED",
						exchange: q.exchange ?? "",
						quoteType: q.quoteType ?? "EQUITY",
					};
				}
				console.error(
					`Failed to fetch quote for ${tickers[i]}:`,
					r.status === "rejected" ? r.reason : "no data",
				);
				return null;
			})
			.filter(Boolean);

		return NextResponse.json(quotes);
	} catch (error) {
		console.error("Quote error:", error);
		return NextResponse.json([], { status: 500 });
	}
}
