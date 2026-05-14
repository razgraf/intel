"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

const TIPS = [
	"Double click on a card or watchlist item to open the details view",
	"Click the gear icon on watchlist items to add futures symbols where supported",
	"Add stocks, ETFs, crypto or options by ticker to the watchlist",
	'Add special cards to the grid like the "Bloomberg Live" embed',
	'Search for USDC-settled crypto options using the "Deribit" prefix.',
	'Add a "Targets" card to track up to 4 price targets — the card glows when any is within 2%',
	"Set an ISIN code per stock or ETF in the gear menu — first 2 chars hint at the country",
];

const ROTATE_MS = 10_000;

export function TipsPanel() {
	const [index, setIndex] = useState(0);
	const [paused, setPaused] = useState(false);

	const prev = () => setIndex((i) => (i - 1 + TIPS.length) % TIPS.length);
	const next = () => setIndex((i) => (i + 1) % TIPS.length);

	useEffect(() => {
		if (paused) return;
		const id = window.setInterval(() => {
			setIndex((i) => (i + 1) % TIPS.length);
		}, ROTATE_MS);
		return () => window.clearInterval(id);
	}, [paused]);

	return (
		<div
			className="flex items-center gap-1.5 px-3 py-2"
			onMouseEnter={() => setPaused(true)}
			onMouseLeave={() => setPaused(false)}
		>
			<button
				type="button"
				onClick={prev}
				className="shrink-0 text-zinc-600 hover:text-zinc-400 transition-colors"
			>
				<ChevronLeft className="h-3 w-3" />
			</button>
			<p className="flex-1 text-[11px] text-zinc-500 text-center leading-tight select-none">
				{TIPS[index]}
			</p>
			<button
				type="button"
				onClick={next}
				className="shrink-0 text-zinc-600 hover:text-zinc-400 transition-colors"
			>
				<ChevronRight className="h-3 w-3" />
			</button>
			<span className="shrink-0 text-[10px] text-zinc-600 tabular-nums w-6 text-right">
				{index + 1}/{TIPS.length}
			</span>
		</div>
	);
}
