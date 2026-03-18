"use client";

import { SegmentedControl } from "@/components/ui/segmented-control";
import type { WatchlistItem } from "@/entities/watchlist/model/types";
import { PREVIEW_ITEMS } from "@/shared/config/preview-items";
import { AssetCard } from "@/widgets/asset-grid/ui/AssetCard";
import { EmbedCard } from "@/widgets/asset-grid/ui/EmbedCard";
import { useState } from "react";

export default function PreviewPage() {
	const [activeTicker, setActiveTicker] = useState(PREVIEW_ITEMS[0].ticker);
	const activeItem = PREVIEW_ITEMS.find((item) => item.ticker === activeTicker) ?? PREVIEW_ITEMS[0];
	const getPreviewOptionLabel = (item: WatchlistItem): string => {
		if (item.type === "Option" && item.source === "deribit") {
			return "Option (Deribit)";
		}

		if (item.type === "Option") {
			return "Option (Stock)";
		}

		return item.type ?? item.label ?? item.ticker;
	};

	return (
		<div className="flex min-h-screen flex-col items-center bg-[#0a0a0f]">
			<div data-preview-nav className="w-full px-6 pt-6 pb-4">
				<SegmentedControl
					className="mx-auto max-w-5xl"
					size="md"
					value={activeTicker}
					onChange={setActiveTicker}
					options={PREVIEW_ITEMS.map((item) => ({
						label: getPreviewOptionLabel(item),
						value: item.ticker,
					}))}
				/>
			</div>

			<div className="flex flex-1 items-center justify-center px-6 pb-10">
				<div data-preview-ticker={activeItem.ticker} className="w-98 max-w-98">
					{activeItem.type === "Embed" ? (
						<EmbedCard item={activeItem} />
					) : (
						<AssetCard item={activeItem} />
					)}
				</div>
			</div>
		</div>
	);
}
