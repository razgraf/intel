"use client";

import { useWatchlistHydrated, useWatchlistStore } from "@/entities/watchlist/model/store";
import { AssetCard } from "./AssetCard";
import { EmbedCard } from "./EmbedCard";

interface AssetGridProps {
	onOpenDetail?: (ticker: string) => void;
}

export function AssetGrid({ onOpenDetail }: AssetGridProps) {
	const hydrated = useWatchlistHydrated();
	const items = useWatchlistStore((s) => s.items);

	if (!hydrated) return null;

	if (items.length === 0) {
		return (
			<div className="flex items-center justify-center h-full text-zinc-500 text-sm">
				Add tickers to your watchlist to see asset cards
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 p-3 overflow-y-auto">
			{items.map((item) =>
				item.type === "Embed" ? (
					<EmbedCard key={item.ticker} item={item} />
				) : (
					<AssetCard
						key={item.ticker}
						item={item}
						onOpenDetail={() => onOpenDetail?.(item.ticker)}
					/>
				),
			)}
		</div>
	);
}
