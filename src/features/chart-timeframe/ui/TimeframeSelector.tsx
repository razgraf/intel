"use client";

import { TIMEFRAMES, type Timeframe } from "@/shared/lib/constants";

interface TimeframeSelectorProps {
	value: Timeframe;
	onChange: (tf: Timeframe) => void;
	size?: "sm" | "md";
}

export function TimeframeSelector({ value, onChange, size = "sm" }: TimeframeSelectorProps) {
	return (
		<div className="flex items-center gap-0.5">
			{TIMEFRAMES.map((tf) => (
				<button
					type="button"
					key={tf}
					onClick={() => onChange(tf)}
					className={`rounded px-2 transition-colors ${
						size === "sm" ? "py-0.5 text-[10px]" : "py-1 text-xs"
					} ${
						value === tf
							? "bg-zinc-700 text-zinc-100 font-medium"
							: "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
					}`}
				>
					{tf}
				</button>
			))}
		</div>
	);
}
