import {
	POLYMARKET_GAMMA_BASE,
	type PolymarketEvent,
	type PolymarketMarket,
	parseStringArray,
	toNumber,
} from "@/shared/lib/polymarket";
import { NextResponse } from "next/server";

const CACHE_TTL = 25_000;
const cache = new Map<string, { data: PolymarketEvent | null; ts: number }>();

interface RawMarket extends Omit<PolymarketMarket, "outcomes" | "outcomePrices"> {
	outcomes?: string[] | string;
	outcomePrices?: string[] | string;
}

interface RawEvent extends Omit<PolymarketEvent, "markets"> {
	markets?: RawMarket[];
}

function mapMarket(raw: RawMarket): PolymarketMarket {
	return {
		id: String(raw.id ?? ""),
		question: raw.question ?? "",
		slug: raw.slug,
		conditionId: raw.conditionId,
		endDate: raw.endDate,
		outcomes: parseStringArray(raw.outcomes),
		outcomePrices: parseStringArray(raw.outcomePrices),
		volume: toNumber(raw.volume),
		volume24hr: toNumber(raw.volume24hr),
		liquidity: toNumber(raw.liquidity),
		lastTradePrice: typeof raw.lastTradePrice === "number" ? raw.lastTradePrice : undefined,
		bestBid: typeof raw.bestBid === "number" ? raw.bestBid : undefined,
		bestAsk: typeof raw.bestAsk === "number" ? raw.bestAsk : undefined,
		image: raw.image,
		icon: raw.icon,
		groupItemTitle: raw.groupItemTitle,
		closed: raw.closed,
		active: raw.active,
	};
}

function mapEvent(raw: RawEvent): PolymarketEvent {
	return {
		id: String(raw.id),
		ticker: raw.ticker,
		slug: raw.slug,
		title: raw.title,
		description: raw.description,
		image: raw.image,
		icon: raw.icon,
		liquidity: toNumber(raw.liquidity),
		volume: toNumber(raw.volume),
		volume24hr: toNumber(raw.volume24hr),
		openInterest: toNumber(raw.openInterest),
		endDate: raw.endDate,
		closed: raw.closed,
		active: raw.active,
		markets: Array.isArray(raw.markets) ? raw.markets.map(mapMarket) : [],
		tags: Array.isArray(raw.tags) ? raw.tags : [],
	};
}

async function fetchEvent(slug: string): Promise<PolymarketEvent | null> {
	const url = new URL(`${POLYMARKET_GAMMA_BASE}/events`);
	url.searchParams.set("slug", slug);
	const res = await fetch(url, { headers: { accept: "application/json" } });
	if (!res.ok) throw new Error(`Polymarket events ${res.status}`);
	const data = (await res.json()) as RawEvent[];
	if (!Array.isArray(data) || data.length === 0) return null;
	return mapEvent(data[0]);
}

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const slug = searchParams.get("slug")?.trim();

	if (!slug) {
		return NextResponse.json({ error: "Missing slug" }, { status: 400 });
	}

	const cached = cache.get(slug);
	if (cached && Date.now() - cached.ts < CACHE_TTL) {
		return NextResponse.json(cached.data);
	}

	try {
		const event = await fetchEvent(slug);
		cache.set(slug, { data: event, ts: Date.now() });
		if (!event) {
			return NextResponse.json(null, { status: 404 });
		}
		return NextResponse.json(event);
	} catch (error) {
		console.error("[polymarket/event]", error);
		return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
	}
}
