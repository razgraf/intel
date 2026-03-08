"use client";

import { EXCHANGES, formatCountdown, getExchangeStatus } from "@/shared/lib/exchanges";
import { useEffect, useState } from "react";

export function MarketHoursPanel() {
	const [now, setNow] = useState<Date | null>(null);

	useEffect(() => {
		setNow(new Date());
		const interval = setInterval(() => setNow(new Date()), 60_000);
		return () => clearInterval(interval);
	}, []);

	if (!now) return null;

	const statuses = EXCHANGES.map((exchange) => getExchangeStatus(exchange, now));

	return (
		<div className="space-y-1">
			<h3 className="text-[10px] uppercase tracking-wider text-zinc-500 mb-2 px-1">Market Hours</h3>
			{statuses.map((status) => (
				<div key={status.exchange.id} className="flex items-center justify-between px-1 py-1">
					<div className="flex items-center gap-2">
						<div
							className={`h-1.5 w-1.5 rounded-full ${status.isOpen ? "bg-emerald-500" : "bg-zinc-600"}`}
						/>
						<span className="text-xs text-zinc-300">{status.exchange.name}</span>
					</div>
					<span className="text-[11px] text-zinc-500 tabular-nums">
						{status.isOpen
							? status.exchange.id === "crypto"
								? "24/7"
								: `Closes in ${formatCountdown(status.minutesUntilChange)}`
							: `Opens in ${formatCountdown(status.minutesUntilChange)}`}
					</span>
				</div>
			))}
		</div>
	);
}
