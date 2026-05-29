import { POLYMARKET_GAMMA_BASE, type PolymarketSearchEvent } from "@/shared/lib/polymarket";
import { NextResponse } from "next/server";

const CACHE_TTL = 30_000;
const cache = new Map<string, { data: PolymarketSearchEvent[]; ts: number }>();

interface RawEvent {
	id?: string | number;
	slug?: string;
	title?: string;
	image?: string;
	icon?: string;
	volume?: number | string;
	volume24hr?: number | string;
	endDate?: string;
	closed?: boolean;
}

function mapEvent(raw: RawEvent): PolymarketSearchEvent | null {
	if (!raw?.id || !raw?.slug || !raw?.title) return null;
	return {
		id: String(raw.id),
		slug: raw.slug,
		title: raw.title,
		image: raw.image,
		icon: raw.icon,
		volume: raw.volume,
		volume24hr: raw.volume24hr,
		endDate: raw.endDate,
		closed: raw.closed,
	};
}

async function fetchPreview(): Promise<PolymarketSearchEvent[]> {
	const url = new URL(`${POLYMARKET_GAMMA_BASE}/events`);
	url.searchParams.set("active", "true");
	url.searchParams.set("closed", "false");
	url.searchParams.set("order", "volume24hr");
	url.searchParams.set("ascending", "false");
	url.searchParams.set("limit", "10");
	const res = await fetch(url, { headers: { accept: "application/json" } });
	if (!res.ok) throw new Error(`Polymarket events ${res.status}`);
	const data = (await res.json()) as RawEvent[];
	return Array.isArray(data)
		? data.map(mapEvent).filter((e): e is PolymarketSearchEvent => !!e)
		: [];
}

async function fetchSearch(query: string): Promise<PolymarketSearchEvent[]> {
	const url = new URL(`${POLYMARKET_GAMMA_BASE}/public-search`);
	url.searchParams.set("q", query);
	url.searchParams.set("limit_per_type", "10");
	url.searchParams.set("events_status", "active");
	const res = await fetch(url, { headers: { accept: "application/json" } });
	if (!res.ok) throw new Error(`Polymarket public-search ${res.status}`);
	const data = (await res.json()) as { events?: RawEvent[] };
	const events = Array.isArray(data?.events) ? data.events : [];
	return events.map(mapEvent).filter((e): e is PolymarketSearchEvent => !!e);
}

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const query = searchParams.get("q")?.trim() ?? "";
	const preview = searchParams.get("preview") === "1";
	const cacheKey = preview ? "__preview__" : `q:${query.toLowerCase()}`;

	const cached = cache.get(cacheKey);
	if (cached && Date.now() - cached.ts < CACHE_TTL) {
		return NextResponse.json(cached.data);
	}

	try {
		const results = preview ? await fetchPreview() : query ? await fetchSearch(query) : [];
		cache.set(cacheKey, { data: results, ts: Date.now() });
		return NextResponse.json(results);
	} catch (error) {
		console.error("[polymarket/search]", error);
		return NextResponse.json([], { status: 500 });
	}
}
