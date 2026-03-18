"use client";

import type { WatchlistItem } from "@/entities/watchlist/model/types";
import { ASSET_TYPE_COLORS } from "@/shared/lib/constants";
import {
	formatCountdownTarget,
	getCountdownDate,
	getCountdownStatus,
} from "@/shared/lib/countdown";
import NumberFlow, { NumberFlowGroup } from "@number-flow/react";
import { Calligraph } from "calligraph";
import { useEffect, useMemo, useState } from "react";

interface CountdownCardProps {
	item: WatchlistItem;
}

export function CountdownCard({ item }: CountdownCardProps) {
	const [now, setNow] = useState(() => Date.now());
	const target = useMemo(() => getCountdownDate(item), [item]);
	const status = target ? getCountdownStatus(target, now) : null;
	const clockParts = useMemo(() => {
		if (!status || status.mode !== "clock") return null;
		const [hours = 0, minutes = 0, seconds = 0] = status.primary.split(":").map(Number);
		return { hours, minutes, seconds };
	}, [status]);

	useEffect(() => {
		if (!target || status?.state === "expired") return;
		const interval = window.setInterval(() => setNow(Date.now()), 1_000);
		return () => window.clearInterval(interval);
	}, [status?.state, target]);

	return (
		<div className="relative overflow-hidden rounded-xl border border-[#1e1e2e] bg-[#111118] p-3 flex flex-col gap-3">
			<div className="pointer-events-none absolute inset-x-0 top-0 h-20" />

			<div className="relative flex items-center justify-between">
				<div className="flex items-center gap-1.5">
					<span
						className="rounded-sm bg-zinc-800/60 px-2 py-0.5 text-[10px] font-medium"
						style={{ color: ASSET_TYPE_COLORS.Countdown }}
					>
						Countdown
					</span>
				</div>
			</div>

			<div className="space-y-1">
				<div className="text-sm font-semibold text-zinc-100">
					{item.title ? `${item.title} | ` : ""}
					{item.label ?? "Countdown"}
				</div>
			</div>

			<div className="flex-1 py-2">
				{status ? (
					<div className="space-y-2">
						<div className="text-4xl font-semibold leading-none tabular-nums text-zinc-200">
							{status.mode === "days" ? (
								<NumberFlow
									value={Number(status.primary)}
									willChange
									suffix=" days"
									format={{ maximumFractionDigits: 0 }}
								/>
							) : status.mode === "clock" && clockParts ? (
								<NumberFlowGroup>
									<div className="flex items-center gap-1.5">
										<NumberFlow
											value={clockParts.hours}
											willChange
											format={{ minimumIntegerDigits: 2, maximumFractionDigits: 0 }}
										/>
										<span className="text-zinc-500">:</span>
										<NumberFlow
											value={clockParts.minutes}
											willChange
											format={{ minimumIntegerDigits: 2, maximumFractionDigits: 0 }}
										/>
										<span className="text-zinc-500">:</span>
										<NumberFlow
											value={clockParts.seconds}
											willChange
											format={{ minimumIntegerDigits: 2, maximumFractionDigits: 0 }}
										/>
									</div>
								</NumberFlowGroup>
							) : (
								<Calligraph className="text-zinc-500">{status.primary}</Calligraph>
							)}
						</div>
					</div>
				) : (
					<div className="text-sm text-zinc-500">Invalid countdown target</div>
				)}
			</div>
			<div className="text-[11px] text-zinc-500">
				{target ? formatCountdownTarget(target) : "Invalid target"}
			</div>
			<div className="mt-auto flex items-center justify-between border-t border-[#1e1e2e] pt-3 text-[11px] text-zinc-500">
				<span className="first-letter:capitalize">{status?.state}</span>
				<span className="truncate text-right">{item.countdown?.rawInput ?? "Not set"}</span>
			</div>
		</div>
	);
}
