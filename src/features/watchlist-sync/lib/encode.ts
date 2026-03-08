import type { WatchlistItem } from "@/entities/watchlist/model/types";

export function encodeWatchlist(items: WatchlistItem[]): string {
  const stripped = items.map(({ notes, ...rest }) => rest);
  const json = JSON.stringify(stripped);
  const base64 = btoa(json)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return base64;
}

export function decodeWatchlist(payload: string): WatchlistItem[] | null {
  try {
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64);
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) return null;
    for (const item of parsed) {
      if (typeof item?.ticker !== "string" || !item.ticker) return null;
    }
    return parsed as WatchlistItem[];
  } catch {
    return null;
  }
}
