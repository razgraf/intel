import type { WatchlistItem } from "@/entities/watchlist/model/types";
import { isAccountsEnabled } from "@/shared/lib/accounts-config";
import { getRedis, watchlistKey } from "@/shared/lib/redis";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const MAX_ITEMS = 200;

function notConfigured() {
	return NextResponse.json({ error: "Account features not configured" }, { status: 503 });
}

export async function GET() {
	if (!isAccountsEnabled()) return notConfigured();

	const { userId } = await auth();
	if (!userId) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const redis = getRedis();
	if (!redis) return notConfigured();

	try {
		const items = await redis.get<WatchlistItem[]>(watchlistKey(userId));
		return NextResponse.json({ items });
	} catch (err) {
		console.error("[/api/watchlist GET] redis error", err);
		return NextResponse.json({ error: "Internal error" }, { status: 500 });
	}
}

function isValidItems(value: unknown): value is WatchlistItem[] {
	if (!Array.isArray(value)) return false;
	for (const v of value) {
		if (!v || typeof v !== "object") return false;
		if (typeof (v as { ticker?: unknown }).ticker !== "string") return false;
	}
	return true;
}

export async function PUT(request: Request) {
	if (!isAccountsEnabled()) return notConfigured();

	const { userId } = await auth();
	if (!userId) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const redis = getRedis();
	if (!redis) return notConfigured();

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
	}

	const items = (body as { items?: unknown })?.items;
	if (!isValidItems(items)) {
		return NextResponse.json({ error: "Invalid items shape" }, { status: 400 });
	}
	if (items.length > MAX_ITEMS) {
		return NextResponse.json({ error: `Too many items (max ${MAX_ITEMS})` }, { status: 413 });
	}

	try {
		await redis.set(watchlistKey(userId), items);
		return NextResponse.json({ ok: true });
	} catch (err) {
		console.error("[/api/watchlist PUT] redis error", err);
		return NextResponse.json({ error: "Internal error" }, { status: 500 });
	}
}
