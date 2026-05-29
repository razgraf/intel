import type { WatchlistItem } from "@/entities/watchlist/model/types";
import { isAccountsEnabled } from "@/shared/lib/accounts-config";
import { getRedis, watchlistKey } from "@/shared/lib/redis";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const MAX_ITEMS = 200;
const MAX_ISINS = 200;
const ISIN_REGEX = /^[A-Z0-9]{12}$/;

interface StoredPayload {
	watchlist: WatchlistItem[];
	isins: Record<string, string>;
}

function notConfigured() {
	return NextResponse.json({ error: "Account features not configured" }, { status: 503 });
}

function normalizeStored(raw: unknown): {
	watchlist: WatchlistItem[] | null;
	isins: Record<string, string>;
} {
	if (raw === null || raw === undefined) {
		return { watchlist: null, isins: {} };
	}
	// Legacy: bare array of items.
	if (Array.isArray(raw)) {
		return { watchlist: raw as WatchlistItem[], isins: {} };
	}
	// New: { watchlist, isins }.
	if (typeof raw === "object") {
		const obj = raw as Partial<StoredPayload>;
		const watchlist = Array.isArray(obj.watchlist) ? obj.watchlist : [];
		const isins =
			obj.isins && typeof obj.isins === "object" && !Array.isArray(obj.isins)
				? (obj.isins as Record<string, string>)
				: {};
		return { watchlist, isins };
	}
	return { watchlist: null, isins: {} };
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
		const raw = await redis.get<unknown>(watchlistKey(userId));
		const { watchlist, isins } = normalizeStored(raw);
		return NextResponse.json({ items: watchlist, isins });
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

function isValidIsins(value: unknown): value is Record<string, string> {
	if (!value || typeof value !== "object" || Array.isArray(value)) return false;
	for (const [k, v] of Object.entries(value)) {
		if (typeof k !== "string" || !k) return false;
		if (typeof v !== "string" || !ISIN_REGEX.test(v)) return false;
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
	const isinsRaw = (body as { isins?: unknown })?.isins ?? {};

	if (!isValidItems(items)) {
		return NextResponse.json({ error: "Invalid items shape" }, { status: 400 });
	}
	if (items.length > MAX_ITEMS) {
		return NextResponse.json({ error: `Too many items (max ${MAX_ITEMS})` }, { status: 413 });
	}
	if (!isValidIsins(isinsRaw)) {
		return NextResponse.json({ error: "Invalid isins shape" }, { status: 400 });
	}
	if (Object.keys(isinsRaw).length > MAX_ISINS) {
		return NextResponse.json({ error: `Too many ISINs (max ${MAX_ISINS})` }, { status: 413 });
	}

	const payload: StoredPayload = { watchlist: items, isins: isinsRaw };

	try {
		await redis.set(watchlistKey(userId), payload);
		return NextResponse.json({ ok: true });
	} catch (err) {
		console.error("[/api/watchlist PUT] redis error", err);
		return NextResponse.json({ error: "Internal error" }, { status: 500 });
	}
}
