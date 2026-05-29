import type { WatchlistItem } from "@/entities/watchlist/model/types";

export interface CloudWatchlistPayload {
	items: WatchlistItem[] | null;
	isins: Record<string, string>;
}

export async function fetchCloudWatchlist(): Promise<CloudWatchlistPayload> {
	const res = await fetch("/api/watchlist", { cache: "no-store" });
	if (!res.ok) {
		throw new Error(`fetchCloudWatchlist: ${res.status}`);
	}
	const data = (await res.json()) as {
		items: WatchlistItem[] | null;
		isins?: Record<string, string>;
	};
	return { items: data.items, isins: data.isins ?? {} };
}

export async function pushCloudWatchlist(
	items: WatchlistItem[],
	isins: Record<string, string>,
): Promise<void> {
	const res = await fetch("/api/watchlist", {
		method: "PUT",
		headers: { "content-type": "application/json" },
		body: JSON.stringify({ items, isins }),
	});
	if (!res.ok) {
		throw new Error(`pushCloudWatchlist: ${res.status}`);
	}
}
