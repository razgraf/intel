"use client";

import type { WatchlistItem } from "@/entities/watchlist/model/types";
import { ASSET_TYPE_COLORS } from "@/shared/lib/constants";
import { useMemo } from "react";

interface EmbedCardProps {
	item: WatchlistItem;
}

function toYouTubeEmbedUrl(url: string): string {
	const match = url.match(/(?:v=|\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
	if (match) {
		return `https://www.youtube.com/embed/${match[1]}?autoplay=1&mute=1`;
	}
	return url;
}

export function EmbedCard({ item }: EmbedCardProps) {
	const embedUrl = useMemo(() => {
		if (item.embed?.kind === "youtube") {
			return toYouTubeEmbedUrl(item.embed.url);
		}
		return null;
	}, [item.embed]);

	return (
		<div className="rounded-xl border border-[#1e1e2e] bg-[#111118] p-3 flex flex-col gap-2">
			{/* Header */}
			<div className="flex items-center gap-1.5">
				<span
					className="rounded-sm bg-zinc-800/60 px-2 py-0.5 text-[10px] font-medium"
					style={{ color: ASSET_TYPE_COLORS.Embed }}
				>
					Embed
				</span>
				<span className="text-sm font-semibold text-zinc-100">{item.label ?? item.ticker}</span>
			</div>

			{/* Body */}
			{embedUrl ? (
				<div className="aspect-video w-full overflow-hidden rounded-lg">
					<iframe
						src={embedUrl}
						title={item.label ?? item.ticker}
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
						allowFullScreen
						className="h-full w-full border-0"
					/>
				</div>
			) : (
				<div className="flex items-center justify-center aspect-video w-full rounded-lg bg-zinc-900 text-sm text-zinc-500">
					Unsupported embed
				</div>
			)}
		</div>
	);
}
