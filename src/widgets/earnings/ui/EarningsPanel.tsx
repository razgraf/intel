"use client";

import { useEarnings } from "@/entities/asset/api/queries";
import type { EarningsEvent } from "@/entities/asset/model/types";
import { useWatchlistStore } from "@/entities/watchlist/model/store";
import { Calendar } from "lucide-react";
import { useState } from "react";

function formatRelativeDate(dateStr: string): string {
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const target = new Date(`${dateStr}T00:00:00`);
	const diffMs = target.getTime() - today.getTime();
	const diffDays = Math.round(diffMs / (24 * 60 * 60 * 1000));

	if (diffDays === 0) return "Today";
	if (diffDays === 1) return "Tomorrow";
	return `in ${diffDays}d`;
}

function formatDate(dateStr: string): string {
	const d = new Date(`${dateStr}T00:00:00`);
	return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function hourLabel(hour: string): string {
	switch (hour) {
		case "bmo":
			return "BMO";
		case "amc":
			return "AMC";
		case "dmh":
			return "DMH";
		default:
			return "";
	}
}

export function EarningsPanel() {
	const items = useWatchlistStore((s) => s.items);
	const symbols = items.map((i) => i.ticker);
	const { data: earnings = [] } = useEarnings(symbols);
	const [showAll, setShowAll] = useState(false);

	const sorted = [...earnings].sort((a, b) => a.date.localeCompare(b.date));

	if (sorted.length === 0) {
		return (
			<div className="px-3 py-2">
				<div className="flex items-center gap-1.5 mb-2">
					<Calendar className="h-3 w-3 text-zinc-500" />
					<span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
						Earnings
					</span>
				</div>
				<p className="text-[11px] text-zinc-600">No upcoming earnings</p>
			</div>
		);
	}

	const displayed = showAll ? sorted : sorted.slice(0, 5);

	return (
		<div className="px-3 py-2">
			<div className="flex items-center gap-1.5 mb-2">
				<Calendar className="h-3 w-3 text-zinc-500" />
				<span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
					Earnings
				</span>
			</div>
			<div className="space-y-1">
				{displayed.map((e) => (
					<EarningsRow key={e.symbol} event={e} />
				))}
			</div>
			{sorted.length > 5 && (
				<button
					type="button"
					onClick={() => setShowAll(!showAll)}
					className="mt-1.5 text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors"
				>
					{showAll ? "Show less" : `Show all (${sorted.length})`}
				</button>
			)}
		</div>
	);
}

function EarningsRow({ event }: { event: EarningsEvent }) {
	const relative = formatRelativeDate(event.date);
	const isImminent = relative === "Today" || relative === "Tomorrow";

	return (
		<div className="flex items-center justify-between text-[11px]">
			<span className="font-medium text-zinc-300 w-16 truncate">{event.symbol}</span>
			<span className="text-zinc-500">{formatDate(event.date)}</span>
			{hourLabel(event.hour) && (
				<span className="text-[9px] rounded bg-zinc-800 px-1 py-0.5 text-zinc-500">
					{hourLabel(event.hour)}
				</span>
			)}
			<span className={`tabular-nums ${isImminent ? "text-amber-400" : "text-zinc-500"}`}>
				{relative}
			</span>
		</div>
	);
}
