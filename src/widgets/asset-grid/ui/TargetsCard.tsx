"use client";

import { useQuotes } from "@/entities/asset/api/queries";
import type { TargetRow, WatchlistItem } from "@/entities/watchlist/model/types";
import { ItemSettingsPopover } from "@/features/item-settings/ui/ItemSettingsPopover";
import { ASSET_TYPE_COLORS } from "@/shared/lib/constants";
import { formatPrice } from "@/shared/lib/format";
import { isWithinThreshold, targetDeviation } from "@/shared/lib/targets";
import { BorderBeam } from "@/shared/ui/BorderBeam";
import { useMemo } from "react";

interface TargetsCardProps {
	item: WatchlistItem;
}

export function TargetsCard({ item }: TargetsCardProps) {
	const rows = item.targets?.rows ?? [];
	const tickers = useMemo(() => rows.map((r) => r.ticker), [rows]);
	const { data: quotes = [] } = useQuotes(tickers);
	const quoteMap = useMemo(() => new Map(quotes.map((q) => [q.symbol, q])), [quotes]);

	const anyClose = rows.some((row) => {
		const current = quoteMap.get(row.ticker)?.regularMarketPrice;
		return current != null && isWithinThreshold(current, row.price);
	});

	return (
		<BorderBeam active={anyClose}>
			<div className="relative rounded-xl border border-[#1e1e2e] bg-[#111118] p-3 flex flex-col gap-3 h-full">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-1.5">
						<span
							className="rounded-sm bg-zinc-800/60 px-2 py-0.5 text-[10px] font-medium"
							style={{ color: ASSET_TYPE_COLORS.Targets }}
						>
							Targets
						</span>
						<span className="text-[11px] text-zinc-500">
							{rows.length}/{4}
						</span>
					</div>
					<ItemSettingsPopover item={item} />
				</div>

				{/* Body */}
				{rows.length === 0 ? (
					<div className="flex-1 flex items-center justify-center py-6 text-xs text-zinc-500 text-center">
						No targets yet. Open settings to add up to 4 tickers.
					</div>
				) : (
					<div className="flex flex-col gap-1.5">
						{rows.map((row) => (
							<TargetRowItem key={row.ticker} row={row} quote={quoteMap.get(row.ticker)} />
						))}
					</div>
				)}
			</div>
		</BorderBeam>
	);
}

function TargetRowItem({
	row,
	quote,
}: {
	row: TargetRow;
	quote: { regularMarketPrice?: number; currency?: string } | undefined;
}) {
	const current = quote?.regularMarketPrice;
	const currency = quote?.currency ?? "USD";
	const dev = current != null ? targetDeviation(current, row.price) : null;
	const close = current != null && isWithinThreshold(current, row.price);

	const devColor =
		dev == null
			? "text-zinc-600"
			: close
				? "text-emerald-400"
				: dev >= 0
					? "text-emerald-500"
					: "text-zinc-600";

	return (
		<div
			className={`flex items-center gap-2 rounded-md px-2 py-1.5 ${
				close ? "bg-emerald-500/10 ring-1 ring-emerald-500/40" : "bg-zinc-900/40"
			}`}
		>
			<span className="text-xs font-medium text-zinc-100 truncate min-w-0">{row.ticker}</span>
			<div className="ml-auto flex items-center gap-2 text-[11px] tabular-nums">
				<span className="text-zinc-300">
					{current != null ? formatPrice(current, currency) : "—"}
				</span>
				<span className="text-zinc-600">→</span>
				<span className="text-zinc-400">{formatPrice(row.price, currency)}</span>
				<span className={`min-w-[3.5em] text-right ${devColor}`}>
					{dev != null ? `${dev >= 0 ? "+" : ""}${(dev * 100).toFixed(2)}%` : "—"}
				</span>
			</div>
		</div>
	);
}
