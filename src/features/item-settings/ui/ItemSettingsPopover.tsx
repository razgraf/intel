"use client";

import { useSearch } from "@/entities/asset/api/queries";
import { isCountdownItem, isIsinCompatible } from "@/entities/watchlist/model/helpers";
import { useWatchlistStore } from "@/entities/watchlist/model/store";
import type { WatchlistItem } from "@/entities/watchlist/model/types";
import { CountdownDialog } from "@/features/countdown/ui/CountdownDialog";
import { Dialog } from "@/shared/ui/Dialog";
import { Search, Settings } from "lucide-react";
import { useEffect, useState } from "react";

interface ItemSettingsPopoverProps {
	item: WatchlistItem;
}

export function ItemSettingsPopover({ item }: ItemSettingsPopoverProps) {
	const update = useWatchlistStore((s) => s.update);
	const [open, setOpen] = useState(false);
	const [futuresTicker, setFuturesTicker] = useState(item.futuresTicker ?? "");
	const [futuresQuery, setFuturesQuery] = useState("");
	const [debouncedQuery, setDebouncedQuery] = useState("");
	const [isin, setIsin] = useState(item.isin ?? "");
	const [notes, setNotes] = useState(item.notes ?? "");
	const showIsinField = isIsinCompatible(item);

	useEffect(() => {
		const timer = setTimeout(() => setDebouncedQuery(futuresQuery), 300);
		return () => clearTimeout(timer);
	}, [futuresQuery]);

	const { data: searchResults = [], isLoading: searching } = useSearch(debouncedQuery);

	function handleOpen(e: React.MouseEvent) {
		e.stopPropagation();
		setFuturesTicker(item.futuresTicker ?? "");
		setIsin(item.isin ?? "");
		setNotes(item.notes ?? "");
		setFuturesQuery("");
		setDebouncedQuery("");
		setOpen(true);
	}

	function handleClose() {
		setOpen(false);
	}

	function handleSave() {
		update(item.ticker, {
			futuresTicker: futuresTicker || undefined,
			isin: showIsinField ? isin.trim() || undefined : item.isin,
			notes: notes || undefined,
		});
		handleClose();
	}

	if (isCountdownItem(item)) {
		return (
			<>
				<button
					type="button"
					onClick={(e) => {
						e.stopPropagation();
						setOpen(true);
					}}
					className="rounded p-0.5 text-zinc-600 hover:bg-zinc-800 hover:text-zinc-300 transition-colors"
				>
					<Settings className="h-3 w-3" />
				</button>
				<CountdownDialog
					open={open}
					onClose={handleClose}
					initialTitle={item.title ?? ""}
					initialValue={item.countdown?.rawInput ?? item.label ?? ""}
					title="Edit Countdown"
					onSave={({ title, rawInput, targetAt }) => {
						update(item.ticker, {
							title: title || undefined,
							label: rawInput,
							source: "countdown",
							countdown: {
								rawInput,
								targetAt: targetAt.toISOString(),
							},
						});
						handleClose();
					}}
				/>
			</>
		);
	}

	return (
		<>
			<button
				type="button"
				onClick={handleOpen}
				className="rounded p-0.5 text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
			>
				<Settings className="h-3 w-3" />
			</button>
			<Dialog open={open} onClose={handleClose}>
				<div className="p-4 space-y-4">
					<h3 className="text-sm font-semibold text-zinc-100">Settings — {item.ticker}</h3>

					{/* Futures ticker with search */}
					<div className="space-y-1.5">
						<span className="text-[10px] uppercase tracking-wider text-zinc-500 block">
							Futures Ticker
						</span>
						<p className="text-[11px] text-zinc-500 leading-tight">
							Link a futures contract to show its price alongside the spot price
						</p>
						{futuresTicker && (
							<div className="flex items-center gap-2">
								<span className="text-xs text-zinc-200">{futuresTicker}</span>
								<button
									type="button"
									onClick={() => setFuturesTicker("")}
									className="text-[10px] text-zinc-500 hover:text-red-400 transition-colors"
								>
									Clear
								</button>
							</div>
						)}
						<div className="relative">
							<div className="flex items-center gap-2 rounded-lg bg-[#1e1e2e] px-2.5 py-1.5">
								<Search className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
								<input
									type="text"
									value={futuresQuery}
									onChange={(e) => setFuturesQuery(e.target.value)}
									placeholder="Search futures ticker..."
									className="w-full bg-transparent text-xs text-zinc-100 outline-none placeholder:text-zinc-500"
								/>
							</div>
							{debouncedQuery && (
								<div className="absolute z-10 mt-1 w-full rounded-lg border border-[#1e1e2e] bg-[#18181b] shadow-xl max-h-40 overflow-y-auto">
									{searching ? (
										<div className="px-3 py-3 text-center text-xs text-zinc-500">Searching...</div>
									) : searchResults.length === 0 ? (
										<div className="px-3 py-3 text-center text-xs text-zinc-500">No results</div>
									) : (
										<ul className="py-1">
											{searchResults.slice(0, 8).map((r) => (
												<li key={r.symbol}>
													<button
														type="button"
														onClick={() => {
															setFuturesTicker(r.symbol);
															setFuturesQuery("");
															setDebouncedQuery("");
														}}
														className="flex w-full items-center justify-between px-3 py-1.5 text-left hover:bg-[#1e1e2e] transition-colors"
													>
														<span className="text-xs font-medium text-zinc-100">{r.symbol}</span>
														<span className="text-[10px] text-zinc-500 truncate max-w-[140px] ml-2">
															{r.shortname}
														</span>
													</button>
												</li>
											))}
										</ul>
									)}
								</div>
							)}
						</div>
					</div>

					{/* ISIN */}
					{showIsinField && (
						<div className="space-y-1.5">
							<span className="text-[10px] uppercase tracking-wider text-zinc-500 block">ISIN</span>
							<p className="text-[11px] text-zinc-500 leading-tight">
								12-char identifier (e.g. US88160R1014) — first 2 chars are the country code.
							</p>
							<input
								type="text"
								value={isin}
								onChange={(e) => setIsin(e.target.value.toUpperCase())}
								maxLength={12}
								placeholder="e.g. US88160R1014"
								className="w-full rounded-lg bg-[#1e1e2e] px-2.5 py-1.5 text-xs tabular-nums text-zinc-100 outline-none placeholder:text-zinc-500 focus:ring-1 focus:ring-zinc-600"
							/>
						</div>
					)}

					{/* Notes */}
					<div className="space-y-1.5">
						<span className="text-[10px] uppercase tracking-wider text-zinc-500 block">Notes</span>
						<p className="text-[11px] text-zinc-500 leading-tight">
							Personal notes about this asset (not shown elsewhere)
						</p>
						<textarea
							value={notes}
							onChange={(e) => setNotes(e.target.value)}
							rows={3}
							className="w-full rounded-lg bg-[#1e1e2e] px-2.5 py-1.5 text-xs text-zinc-100 outline-none resize-none placeholder:text-zinc-500 focus:ring-1 focus:ring-zinc-600"
							placeholder="Add notes..."
						/>
					</div>

					{/* Actions */}
					<div className="flex items-center justify-end gap-2 pt-1">
						<button
							type="button"
							onClick={handleClose}
							className="rounded-lg px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
						>
							Cancel
						</button>
						<button
							type="button"
							onClick={handleSave}
							className="rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-900 hover:bg-white transition-colors"
						>
							Save
						</button>
					</div>
				</div>
			</Dialog>
		</>
	);
}
