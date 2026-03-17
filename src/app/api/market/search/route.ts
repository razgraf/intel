import yahooFinance, { withTimeout } from "@/shared/lib/yahoo";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const query = searchParams.get("q");

	if (!query || query.length < 1) {
		return NextResponse.json([]);
	}

	try {
		const results = (await withTimeout(yahooFinance.search(query, { newsCount: 0 }))) as {
			quotes?: Array<{ symbol: string; shortname?: string; exchange?: string; quoteType?: string }>;
		};
		const quotes = (results.quotes ?? [])
			.filter((q) => q.symbol)
			.map((q) => ({
				symbol: q.symbol,
				shortname: q.shortname ?? q.symbol,
				exchange: q.exchange ?? "",
				quoteType: q.quoteType ?? "EQUITY",
			}));
		return NextResponse.json(quotes);
	} catch (error) {
		console.error("Search error:", error);
		return NextResponse.json([], { status: 500 });
	}
}
