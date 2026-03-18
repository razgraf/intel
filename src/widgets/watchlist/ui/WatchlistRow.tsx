"use client";

import type { Quote } from "@/entities/asset/model/types";
import { isCountdownItem, isEmbedItem } from "@/entities/watchlist/model/helpers";
import { useWatchlistStore } from "@/entities/watchlist/model/store";
import type { WatchlistItem } from "@/entities/watchlist/model/types";
import { ItemSettingsPopover } from "@/features/item-settings/ui/ItemSettingsPopover";
import { getCountdownDate, getCountdownStatus } from "@/shared/lib/countdown";
import { formatPercent, formatPrice } from "@/shared/lib/format";
import { Reorder, useDragControls } from "framer-motion";
import { Clock3 } from "lucide-react";
import { GripVertical, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface WatchlistRowProps {
	item: WatchlistItem;
	quote?: Quote;
	deribitPrice?: number;
	isSelected?: boolean;
	onClick?: () => void;
	onOpenDetail?: () => void;
}

export function WatchlistRow({
	item,
	quote,
	deribitPrice,
	isSelected,
	onClick,
	onOpenDetail,
}: WatchlistRowProps) {
	const remove = useWatchlistStore((s) => s.remove);
	const dragControls = useDragControls();
	const isDeribit = item.source === "deribit";
	const price = isDeribit ? (deribitPrice ?? 0) : (quote?.regularMarketPrice ?? 0);
	const changePercent = isDeribit ? 0 : (quote?.regularMarketChangePercent ?? 0);
	const isOpen = isDeribit || quote?.marketState === "REGULAR";
	const countdownTarget = useMemo(() => getCountdownDate(item), [item]);
	const [now, setNow] = useState(() => Date.now());
	const countdownStatus = countdownTarget ? getCountdownStatus(countdownTarget, now) : null;

	useEffect(() => {
		if (!isCountdownItem(item) || !countdownTarget || countdownStatus?.state === "expired") return;
		const interval = window.setInterval(() => setNow(Date.now()), 1_000);
		return () => window.clearInterval(interval);
	}, [countdownStatus?.state, countdownTarget, item]);

	return (
		<Reorder.Item
			value={item}
			dragListener={false}
			dragControls={dragControls}
			role="button"
			tabIndex={0}
			className={`group flex w-full items-center gap-2 rounded-lg px-2 py-1.5 cursor-pointer transition-colors ${
				isSelected ? "bg-[#1e1e2e]" : "hover:bg-[#1e1e2e]/50"
			}`}
			onClick={onClick}
			onDoubleClick={!isEmbedItem(item) && !isCountdownItem(item) ? onOpenDetail : undefined}
			onKeyDown={(e) => e.key === "Enter" && onClick?.()}
		>
			<div className="shrink-0 cursor-grab touch-none" onPointerDown={(e) => dragControls.start(e)}>
				<GripVertical className="h-3 w-3 text-zinc-600" />
			</div>
			{isEmbedItem(item) ? (
				<>
					<div className="h-1.5 w-1.5 rounded-full shrink-0 bg-rose-600" />
					<span className="text-xs font-medium text-zinc-200 flex-1 truncate text-left">
						{item.label ?? item.ticker}
					</span>
					<span className="text-[10px] text-zinc-500">Embed</span>
				</>
			) : isCountdownItem(item) ? (
				<>
					<div className="h-1.5 w-1.5 rounded-full shrink-0 bg-yellow-300" />
					<div className="min-w-0 flex-1 text-left">
						<div className="truncate text-xs font-medium text-zinc-100">
							{item.label ?? "Countdown"}
						</div>
					</div>
					<span
						className={`text-[11px] tabular-nums ${
							countdownStatus?.state === "expired" ? "text-zinc-500" : "text-yellow-300"
						}`}
					>
						{countdownStatus?.primary ?? "--"}
					</span>
				</>
			) : (
				<>
					<div
						className={`h-1.5 w-1.5 rounded-full shrink-0 ${isOpen ? "bg-emerald-500" : "bg-zinc-600"}`}
					/>
					<span className="text-xs font-medium text-zinc-200 w-16 truncate text-left">
						{item.ticker}
					</span>
					<span className="text-xs tabular-nums text-zinc-300 flex-1 text-right">
						{price > 0 ? formatPrice(price, isDeribit ? "USD" : quote?.currency) : "---"}
					</span>
					<span
						className={`text-[11px] tabular-nums w-14 text-right ${
							changePercent >= 0 ? "text-emerald-500" : "text-red-500"
						}`}
					>
						{price > 0 ? formatPercent(changePercent) : ""}
					</span>
				</>
			)}
			<div className="flex items-center gap-0.5 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
				<ItemSettingsPopover item={item} />
				<button
					type="button"
					onClick={(e) => {
						e.stopPropagation();
						remove(item.ticker);
					}}
					className="rounded p-0.5 text-zinc-600 hover:text-red-400 hover:bg-zinc-800 transition-colors"
				>
					<X className="h-3 w-3" />
				</button>
			</div>
		</Reorder.Item>
	);
}
