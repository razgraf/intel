"use client";

import { usePolymarketEvent } from "@/entities/asset/api/polymarket-queries";
import { useWatchlistStore } from "@/entities/watchlist/model/store";
import type { WatchlistItem } from "@/entities/watchlist/model/types";
import { ASSET_TYPE_COLORS } from "@/shared/lib/constants";
import { formatCompactCurrency } from "@/shared/lib/format";
import {
	POLYMARKET_EVENT_URL,
	type PolymarketEvent,
	type PolymarketMarket,
	parseStringArray,
	toNumber,
} from "@/shared/lib/polymarket";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useMemo } from "react";

interface PolymarketCardProps {
	item: WatchlistItem;
}

const VISIBLE_ROW_COUNT = 5;

interface OutcomeRow {
	id: string;
	label: string;
	yesPrice: number;
	icon?: string;
	closed?: boolean;
}

function extractRows(event: PolymarketEvent): OutcomeRow[] {
	const rows: OutcomeRow[] = [];
	const markets = event.markets ?? [];
	const isMultiMarket = markets.length > 1;

	for (const market of markets) {
		const outcomes = parseStringArray(market.outcomes);
		const prices = parseStringArray(market.outcomePrices);

		if (outcomes.length > 2) {
			outcomes.forEach((outcome, i) => {
				rows.push({
					id: `${market.id}-${i}`,
					label: outcome,
					yesPrice: toNumber(prices[i]),
					icon: market.icon ?? market.image,
					closed: market.closed,
				});
			});
		} else {
			const label = isMultiMarket
				? (market.groupItemTitle ?? market.question ?? "")
				: (outcomes[0] ?? "Yes");
			rows.push({
				id: market.id,
				label,
				yesPrice: toNumber(prices[0]),
				icon: market.icon ?? market.image,
				closed: market.closed,
			});
		}
	}

	rows.sort((a, b) => b.yesPrice - a.yesPrice);
	return rows;
}

function formatYesPct(p: number): string {
	const pct = p * 100;
	if (pct >= 0.05 && pct < 10) return `${pct.toFixed(1)}%`;
	return `${Math.round(pct)}%`;
}

function isMarketResolved(market: PolymarketMarket): boolean {
	if (market.closed) return true;
	const prices = parseStringArray(market.outcomePrices).map(toNumber);
	return prices.some((p) => p === 1) && prices.some((p) => p === 0);
}

export function PolymarketCard({ item }: PolymarketCardProps) {
	const slug = item.polymarket?.slug ?? item.ticker;
	const cached = item.polymarket;
	const { data: event, isLoading, isError } = usePolymarketEvent(slug);
	const updateItem = useWatchlistStore((s) => s.update);

	// Refresh cached title/image on every successful fetch so future loads
	// render instantly and exports include fresh metadata.
	useEffect(() => {
		if (!event) return;
		const nextImage = event.image ?? event.icon;
		const sameTitle = cached?.title === event.title;
		const sameImage = cached?.image === nextImage;
		const sameId = cached?.eventId === event.id;
		if (sameTitle && sameImage && sameId) return;
		updateItem(item.ticker, {
			polymarket: {
				eventId: event.id,
				slug: event.slug,
				title: event.title,
				image: nextImage,
			},
		});
	}, [event, cached, item.ticker, updateItem]);

	const title = event?.title ?? cached?.title ?? item.label ?? item.ticker;
	const image = event?.image ?? event?.icon ?? cached?.image;
	const eventUrl = POLYMARKET_EVENT_URL(slug);

	const rows = useMemo(() => (event ? extractRows(event) : []), [event]);
	const visibleRows = rows.slice(0, VISIBLE_ROW_COUNT);
	const hiddenCount = Math.max(0, rows.length - VISIBLE_ROW_COUNT);

	const resolved = useMemo(() => {
		if (!event) return false;
		if (event.closed) return true;
		const markets = event.markets ?? [];
		if (markets.length === 0) return false;
		return markets.every(isMarketResolved);
	}, [event]);

	const volume24hr = toNumber(event?.volume24hr);
	const notFound = !isLoading && !event && !isError;
	const eventMissing = isError || notFound;

	return (
		<div className="rounded-xl border border-[#1e1e2e] bg-[#111118] p-3 flex flex-col gap-2">
			{/* Header */}
			<div className="flex items-start justify-between gap-2">
				<div className="flex items-start gap-2 min-w-0 flex-1">
					{image ? (
						<img src={image} alt="" className="mt-0.5 h-8 w-8 shrink-0 rounded object-cover" />
					) : (
						<div className="mt-0.5 h-8 w-8 shrink-0 rounded bg-zinc-800" />
					)}
					<div className="min-w-0 flex-1">
						<div className="flex items-center gap-1.5 mb-1">
							<span
								className="rounded-sm bg-zinc-800/60 px-2 py-0.5 text-[10px] font-regular"
								style={{ color: ASSET_TYPE_COLORS.Polymarket }}
							>
								Polymarket
							</span>
							{resolved && (
								<span className="rounded-sm bg-emerald-900/30 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
									Resolved
								</span>
							)}
						</div>
						<div className="text-xs font-semibold text-zinc-100 line-clamp-2">{title}</div>
					</div>
				</div>
				<a
					href={eventUrl}
					target="_blank"
					rel="noopener noreferrer"
					className="relative shrink-0 text-zinc-600 transition-colors hover:text-zinc-300 before:absolute before:-inset-2 before:content-['']"
					title="Open on Polymarket"
				>
					<ArrowUpRight className="h-3.5 w-3.5" />
				</a>
			</div>

			{/* 24h volume */}
			{!resolved && volume24hr > 0 && (
				<div className="flex items-center justify-between text-[11px]">
					<span className="text-zinc-500">24h Volume</span>
					<span className="tabular-nums text-zinc-400">
						{formatCompactCurrency(volume24hr, "USD")}
					</span>
				</div>
			)}

			{/* Outcome rows / skeletons */}
			<div className="flex flex-col flex-1 gap-0.5">
				{visibleRows.length > 0
					? visibleRows.map((row) => (
							<div
								key={row.id}
								className="flex items-center justify-between gap-2 rounded px-1.5 py-1"
							>
								<div className="flex min-w-0 items-center gap-1.5">
									{row.icon ? (
										<img
											src={row.icon}
											alt=""
											className="h-4 w-4 shrink-0 rounded-sm object-cover"
										/>
									) : null}
									<span
										className={`truncate text-sm ${
											resolved && row.yesPrice === 1
												? "font-semibold text-emerald-400"
												: "text-zinc-200"
										}`}
									>
										{row.label}
									</span>
								</div>
								<span className="shrink-0 text-sm font-medium tabular-nums text-zinc-100">
									{formatYesPct(row.yesPrice)}
								</span>
							</div>
						))
					: isLoading && !eventMissing
						? Array.from({ length: 4 }).map((_, i) => (
								<div
									// biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
									key={i}
									className="h-7 animate-pulse rounded bg-zinc-900/60"
								/>
							))
						: null}

				{hiddenCount > 0 && (
					<a
						href={eventUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="pt-1 mt-auto self-center rounded-full bg-zinc-800/60 px-2.5 py-0.5 text-[11px] text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
					>
						+{hiddenCount} more
					</a>
				)}
			</div>

			{/* Error / missing */}
			{eventMissing && (
				<div className="rounded bg-zinc-900/40 px-2 py-2 text-center text-[11px] text-zinc-500">
					Event no longer available on Polymarket
				</div>
			)}
		</div>
	);
}
