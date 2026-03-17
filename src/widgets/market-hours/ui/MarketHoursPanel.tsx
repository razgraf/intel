"use client";

import { EXCHANGES, formatCountdown, getExchangeStatus } from "@/shared/lib/exchanges";
import { Clock } from "lucide-react";
import { useEffect, useState } from "react";

export function MarketHoursPanel() {
	const [now, setNow] = useState<Date | null>(null);

	useEffect(() => {
		setNow(new Date());
		const interval = setInterval(() => setNow(new Date()), 60_000);
		return () => clearInterval(interval);
	}, []);

	if (!now) return null;

	const statuses = EXCHANGES.filter((e) => !e.alwaysOn).map((exchange) =>
		getExchangeStatus(exchange, now),
	);

	return (
		<div className="px-3 py-2">
			<div className="flex items-center gap-1.5 mb-2">
				<Clock className="h-3 w-3 text-zinc-500" />
				<span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
					Market Hours
				</span>
			</div>
			<div className="space-y-1">
				{statuses.map((status) => (
					<div
						key={status.exchange.id}
						className="grid grid-cols-[5rem_1fr] items-center gap-x-2 text-[11px]"
					>
						<div className="flex items-center gap-1.5 truncate">
							<div
								className={`h-1.5 w-1.5 rounded-full shrink-0 ${status.isOpen ? "bg-emerald-500" : "bg-zinc-600"}`}
							/>
							<span className="text-zinc-300 truncate">{status.exchange.name}</span>
						</div>
						<span
							className="text-zinc-500 tabular-nums text-right"
							title={
								Number.isFinite(status.minutesUntilChange)
									? `${status.isOpen ? "Closes" : "Opens"} at ${new Date(now.getTime() + status.minutesUntilChange * 60_000).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" })} GMT`
									: undefined
							}
						>
							{status.isOpen
								? status.exchange.id === "crypto"
									? "24/7"
									: `Closes in ${formatCountdown(status.minutesUntilChange)}`
								: `Opens in ${formatCountdown(status.minutesUntilChange)}`}
						</span>
					</div>
				))}
			</div>
		</div>
	);
}
