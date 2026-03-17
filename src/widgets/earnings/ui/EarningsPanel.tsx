"use client";

import { useEarnings } from "@/entities/asset/api/queries";
import type { EarningsEvent } from "@/entities/asset/model/types";
import { useWatchlistStore } from "@/entities/watchlist/model/store";
import { getUpcomingFOMC } from "@/shared/lib/fomc";
import { Dialog } from "@/shared/ui/Dialog";
import { Calendar, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

function useClientDate() {
	const [date, setDate] = useState<Date | null>(null);
	useEffect(() => setDate(new Date()), []);
	return date;
}

function formatRelativeDate(dateStr: string, now: Date): string {
	const today = new Date(now);
	today.setHours(0, 0, 0, 0);
	const target = new Date(`${dateStr}T00:00:00`);
	const diffMs = target.getTime() - today.getTime();
	const diffDays = Math.round(diffMs / (24 * 60 * 60 * 1000));

	if (diffDays === 0) return "Today";
	if (diffDays === 1) return "Tomorrow";
	return `in ${diffDays}d`;
}

function formatDate(dateStr: string, includeYear = false): string {
	const d = new Date(`${dateStr}T00:00:00`);
	const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
	if (includeYear) options.year = "numeric";
	return d.toLocaleDateString("en-US", options);
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

export function EventsPanel() {
	const items = useWatchlistStore((s) => s.items);
	const symbols = items.map((i) => i.ticker);
	const { data: earnings = [] } = useEarnings(symbols);
	const [dialogOpen, setDialogOpen] = useState(false);
	const now = useClientDate();

	const sortedEarnings = useMemo(
		() => [...earnings].sort((a, b) => a.date.localeCompare(b.date)),
		[earnings],
	);

	const nextFOMC = useMemo(() => {
		if (!now) return null;
		const upcoming = getUpcomingFOMC(now);
		return upcoming[0] ?? null;
	}, [now]);

	const allFOMC = useMemo(() => (now ? getUpcomingFOMC(now) : []), [now]);

	// Inline list: up to 5 earnings + next FOMC, sorted by date
	const inlineItems = useMemo(() => {
		const items: Array<{ key: string; label: string; date: string; hour?: string }> = [];
		for (const e of sortedEarnings.slice(0, 5)) {
			items.push({ key: `earn-${e.symbol}`, label: e.symbol, date: e.date, hour: e.hour });
		}
		if (nextFOMC) {
			items.push({ key: "fomc-next", label: "FOMC", date: nextFOMC.date });
		}
		return items.sort((a, b) => a.date.localeCompare(b.date));
	}, [sortedEarnings, nextFOMC]);

	const totalCount = sortedEarnings.length + allFOMC.length;

	if (!now || inlineItems.length === 0) {
		return (
			<div className="px-3 py-2">
				<div className="flex items-center gap-1.5">
					<Calendar className="h-3 w-3 text-zinc-500" />
					<span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
						Events / Earnings
					</span>
				</div>
				<p className="text-[11px] text-zinc-600 mt-1.5">No upcoming events</p>
			</div>
		);
	}

	return (
		<div className="px-3 py-2">
			<div className="flex items-center justify-between mb-2">
				<div className="flex items-center gap-1.5">
					<Calendar className="h-3 w-3 text-zinc-500" />
					<span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
						Events / Earnings
					</span>
				</div>
				{totalCount > inlineItems.length && (
					<button
						type="button"
						onClick={() => setDialogOpen(true)}
						className="text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors"
					>
						Show all ({totalCount})
					</button>
				)}
			</div>
			<div className="space-y-1">
				{inlineItems.map((e) => (
					<EventRow key={e.key} label={e.label} date={e.date} hour={e.hour} now={now} />
				))}
			</div>

			<Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
				<div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
					<div className="flex items-center justify-between">
						<h2 className="text-sm font-semibold text-zinc-100">All Events & Earnings</h2>
						<button
							type="button"
							onClick={() => setDialogOpen(false)}
							className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
							aria-label="Close"
						>
							<X className="h-4 w-4" />
						</button>
					</div>

					{/* Earnings section */}
					<div>
						<h3 className="text-[10px] uppercase font-bold text-zinc-500 mb-2">Earnings</h3>
						{sortedEarnings.length === 0 ? (
							<p className="text-[11px] text-zinc-600">No upcoming earnings</p>
						) : (
							<div className="space-y-1">
								{sortedEarnings.map((e) => (
									<EventRow
										key={`dialog-earn-${e.symbol}`}
										label={e.symbol}
										date={e.date}
										hour={e.hour}
										now={now}
									/>
								))}
							</div>
						)}
					</div>

					{/* Events section */}
					<div>
						<h3 className="text-[10px] uppercase font-bold text-zinc-500 mb-2">FOMC Meetings</h3>
						{allFOMC.length === 0 ? (
							<p className="text-[11px] text-zinc-600">No upcoming meetings</p>
						) : (
							<div className="space-y-1">
								{allFOMC.map((f) => (
									<EventRow
										key={`dialog-fomc-${f.date}`}
										label="FOMC"
										date={f.date}
										now={now}
										includeYear
									/>
								))}
							</div>
						)}
					</div>
				</div>
			</Dialog>
		</div>
	);
}

function EventRow({
	label,
	date,
	hour,
	now,
	includeYear,
}: { label: string; date: string; hour?: string; now: Date; includeYear?: boolean }) {
	const relative = formatRelativeDate(date, now);
	const isImminent = relative === "Today" || relative === "Tomorrow";

	return (
		<div className="grid grid-cols-[5rem_1fr_1.75rem_auto] items-center gap-x-2 text-[11px]">
			<span className="font-medium text-zinc-300 truncate">{label}</span>
			<span className="text-zinc-500">{formatDate(date, includeYear)}</span>
			{hour && hourLabel(hour) ? (
				<span className="text-[9px] rounded bg-zinc-800 px-1 py-0.5 text-zinc-500 text-center">
					{hourLabel(hour)}
				</span>
			) : (
				<span />
			)}
			<span
				className={`tabular-nums text-right ${isImminent ? "text-amber-400" : "text-zinc-500"}`}
			>
				{relative}
			</span>
		</div>
	);
}
