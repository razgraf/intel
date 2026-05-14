"use client";

import { useDeribitQuotes } from "@/entities/asset/api/deribit-queries";
import { useQuotes } from "@/entities/asset/api/queries";
import {
	isCountdownItem,
	isSpecialWatchlistItem,
	isTargetsItem,
} from "@/entities/watchlist/model/helpers";
import { useWatchlistHydrated, useWatchlistStore } from "@/entities/watchlist/model/store";
import { CountdownDialog } from "@/features/countdown/ui/CountdownDialog";
import { TargetsDialog } from "@/features/targets/ui/TargetsDialog";
import { TickerSearchInput } from "@/features/ticker-search/ui/TickerSearchInput";
import { createCountdownItem } from "@/shared/lib/countdown";
import { createTargetsItem } from "@/shared/lib/targets";
import { Reorder } from "framer-motion";
import { useState } from "react";
import { WatchlistRow } from "./WatchlistRow";

interface WatchlistPanelProps {
	selectedTicker?: string;
	onSelect?: (ticker: string) => void;
	onOpenDetail?: (ticker: string) => void;
}

export function WatchlistPanel({ selectedTicker, onSelect, onOpenDetail }: WatchlistPanelProps) {
	const hydrated = useWatchlistHydrated();
	const items = useWatchlistStore((s) => s.items);
	const add = useWatchlistStore((s) => s.add);
	const update = useWatchlistStore((s) => s.update);
	const reorder = useWatchlistStore((s) => s.reorder);
	const [countdownOpen, setCountdownOpen] = useState(false);
	const [targetsOpen, setTargetsOpen] = useState(false);

	const yahooTickers = items
		.filter((i) => i.source !== "deribit" && !isSpecialWatchlistItem(i))
		.map((i) => i.ticker);
	const deribitTickers = items
		.filter((i) => i.source === "deribit" && !isSpecialWatchlistItem(i))
		.map((i) => i.ticker);

	const { data: quotes = [] } = useQuotes(yahooTickers);
	const { data: deribitQuotes = [] } = useDeribitQuotes(deribitTickers);

	const quoteMap = new Map(quotes.map((q) => [q.symbol, q]));
	const deribitQuoteMap = new Map(deribitQuotes.map((q) => [q.symbol, q]));

	if (!hydrated) return null;

	return (
		<div className="flex flex-col h-full">
			<div className="px-2 pb-2">
				<TickerSearchInput
					onSelect={add}
					onConfigureSpecial={(item) => {
						if (isCountdownItem(item)) {
							setCountdownOpen(true);
						} else if (isTargetsItem(item)) {
							setTargetsOpen(true);
						}
					}}
					placeholder="Add ticker or special card..."
				/>
			</div>
			<div className="flex-1 overflow-y-auto px-1">
				{items.length === 0 ? (
					<div className="text-center text-sm text-zinc-500 py-8">
						Search and add tickers to get started
					</div>
				) : (
					<Reorder.Group
						axis="y"
						values={items}
						onReorder={reorder}
						className="space-y-0.5"
						as="div"
					>
						{items.map((item) => (
							<WatchlistRow
								key={item.ticker}
								item={item}
								quote={quoteMap.get(item.ticker)}
								deribitPrice={deribitQuoteMap.get(item.ticker)?.markPrice}
								isSelected={selectedTicker === item.ticker}
								onClick={() => onSelect?.(item.ticker)}
								onOpenDetail={() => onOpenDetail?.(item.ticker)}
							/>
						))}
					</Reorder.Group>
				)}
			</div>
			<CountdownDialog
				open={countdownOpen}
				onClose={() => setCountdownOpen(false)}
				onSave={({ title, rawInput, targetAt }) => {
					add(createCountdownItem(title, rawInput, targetAt));
					setCountdownOpen(false);
				}}
				title="New Countdown"
			/>
			<TargetsDialog
				open={targetsOpen}
				onClose={() => setTargetsOpen(false)}
				initialRows={[]}
				title="New Targets Card"
				onSave={(rows) => {
					const created = createTargetsItem();
					add(created);
					if (rows.length > 0) {
						update(created.ticker, { targets: { rows } });
					}
					setTargetsOpen(false);
				}}
			/>
		</div>
	);
}
