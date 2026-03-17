import yahooFinance, { withTimeout } from "@/shared/lib/yahoo";
import { cacheLife } from "next/cache";
import { NextResponse } from "next/server";

type ChartInterval =
	| "1m"
	| "2m"
	| "5m"
	| "15m"
	| "30m"
	| "60m"
	| "90m"
	| "1h"
	| "1d"
	| "5d"
	| "1wk"
	| "1mo"
	| "3mo";

function getCacheProfile(interval: ChartInterval) {
	switch (interval) {
		case "1m":
		case "2m":
		case "5m":
			return { revalidate: 120, expire: 600 };
		case "15m":
		case "30m":
			return { revalidate: 300, expire: 1800 };
		case "60m":
		case "90m":
		case "1h":
			return { revalidate: 900, expire: 7200 };
		case "1d":
		case "5d":
			return { revalidate: 3600, expire: 21600 };
		case "1wk":
		case "1mo":
		case "3mo":
			return { revalidate: 21600, expire: 86400 };
		default:
			return { revalidate: 120, expire: 600 };
	}
}

async function fetchChart(symbol: string, range: string, interval: ChartInterval) {
	"use cache";
	cacheLife(getCacheProfile(interval));

	const result = await withTimeout(
		yahooFinance.chart(symbol, {
			period1: getStartDate(range),
			interval,
		}),
	);

	const quotes = result.quotes ?? [];

	return quotes
		.filter((q) => q.close != null && q.close !== 0)
		.map((q) => ({
			time: new Date(q.date).getTime(),
			value: q.close,
			open: q.open ?? q.close,
			high: q.high ?? q.close,
			low: q.low ?? q.close,
			close: q.close,
		}));
}

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const symbol = searchParams.get("symbol");
	const range = searchParams.get("range") ?? "1d";
	const interval = (searchParams.get("interval") ?? "5m") as ChartInterval;

	if (!symbol) {
		return NextResponse.json({ error: "Missing symbol parameter" }, { status: 400 });
	}

	try {
		const points = await fetchChart(symbol, range, interval);
		return NextResponse.json(points);
	} catch (error) {
		console.error("History error:", error);
		return NextResponse.json([], { status: 500 });
	}
}

function getStartDate(range: string): Date {
	const now = new Date();
	switch (range) {
		case "1d":
			return new Date(now.getTime() - 24 * 60 * 60 * 1000);
		case "5d":
			return new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
		case "1mo":
			return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
		case "3mo":
			return new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
		case "1y":
			return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
		case "max":
			return new Date(2000, 0, 1);
		default:
			return new Date(now.getTime() - 24 * 60 * 60 * 1000);
	}
}
