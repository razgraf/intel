"use client";

import type { WatchlistItem } from "@/entities/watchlist/model/types";
import { AssetCard } from "@/widgets/asset-grid/ui/AssetCard";
import { EmbedCard } from "@/widgets/asset-grid/ui/EmbedCard";

const PREVIEW_ITEMS: WatchlistItem[] = [
	{
		ticker: "TSLA",
		label: "Tesla",
		type: "Stock",
		currency: "USD",
	},
	{
		ticker: "^SPX",
		label: "S&P 500",
		type: "Index",
		currency: "USD",
		futuresTicker: "ES=F",
	},
	{
		ticker: "TSLA250620C00250000",
		label: "TSLA Call",
		type: "Option",
		currency: "USD",
	},
	{
		ticker: "ETH-26SEP25-5000-C",
		label: "ETH 5000C",
		type: "Option",
		currency: "USD",
		source: "deribit",
	},
	{
		ticker: "VWCE.DE",
		label: "VWCE",
		type: "ETF",
		currency: "EUR",
	},
	{
		ticker: "GC=F",
		label: "Gold",
		type: "Future",
		currency: "USD",
	},
	{
		ticker: "ETH-USD",
		label: "Ethereum",
		type: "Crypto",
		currency: "USD",
	},
	{
		ticker: "bloomberg-live",
		label: "Bloomberg Live",
		type: "Embed",
		source: "youtube",
		embed: {
			kind: "youtube",
			url: "https://www.youtube.com/watch?v=iEpJwprxDdk",
		},
	},
];

export default function PreviewPage() {
	return (
		<div className="min-h-screen bg-[#0a0a0f] flex items-start justify-center py-12 px-4">
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
				{PREVIEW_ITEMS.map((item) => (
					<div
						key={item.ticker}
						data-preview-ticker={item.ticker}
						className="max-w-[320px] w-[320px]"
					>
						{item.type === "Embed" ? (
							<EmbedCard item={item} />
						) : (
							<AssetCard item={item} />
						)}
					</div>
				))}
			</div>
		</div>
	);
}
