import type { WatchlistItem } from "@/entities/watchlist/model/types";

export async function fetchCloudWatchlist(): Promise<WatchlistItem[] | null> {
	const res = await fetch("/api/watchlist", { cache: "no-store" });
	if (!res.ok) {
		throw new Error(`fetchCloudWatchlist: ${res.status}`);
	}
	const data = (await res.json()) as { items: WatchlistItem[] | null };
	return data.items;
}

export async function pushCloudWatchlist(items: WatchlistItem[]): Promise<void> {
	const res = await fetch("/api/watchlist", {
		method: "PUT",
		headers: { "content-type": "application/json" },
		body: JSON.stringify({ items }),
	});
	if (!res.ok) {
		throw new Error(`pushCloudWatchlist: ${res.status}`);
	}
}
