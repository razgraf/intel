"use client";

import { useDeribitPreview, useDeribitSearch } from "@/entities/asset/api/deribit-queries";
import { usePolymarketPreview, usePolymarketSearch } from "@/entities/asset/api/polymarket-queries";
import { useSearch } from "@/entities/asset/api/queries";
import { inferAssetType } from "@/entities/asset/model/types";
import { isCountdownItem, isTargetsItem } from "@/entities/watchlist/model/helpers";
import type { WatchlistItem } from "@/entities/watchlist/model/types";
import { ASSET_TYPE_COLORS } from "@/shared/lib/constants";
import type { PolymarketSearchEvent } from "@/shared/lib/polymarket";
import { SPECIAL_ITEMS } from "@/shared/lib/special-items";
import { Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { matchPolymarketPrefix } from "../lib/polymarket-prefix";

interface TickerSearchInputProps {
	onSelect: (item: WatchlistItem) => void;
	onConfigureSpecial?: (item: WatchlistItem) => void;
	placeholder?: string;
}

export function TickerSearchInput({
	onSelect,
	onConfigureSpecial,
	placeholder = "Search ticker...",
}: TickerSearchInputProps) {
	const [query, setQuery] = useState("");
	const [debouncedQuery, setDebouncedQuery] = useState("");
	const [isOpen, setIsOpen] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const timer = setTimeout(() => setDebouncedQuery(query), 300);
		return () => clearTimeout(timer);
	}, [query]);

	const lowerQuery = debouncedQuery.toLowerCase().trim();
	const isDeribitFull = lowerQuery.startsWith("deribit ");
	const isDeribitPrefix =
		!isDeribitFull && "deribit".startsWith(lowerQuery) && lowerQuery.length >= 1;
	const deribitQuery = isDeribitFull ? debouncedQuery.slice(8).trim() : "";

	const polymarketMatch = matchPolymarketPrefix(lowerQuery);
	const isPolymarket = polymarketMatch.active;
	const polymarketQuery = polymarketMatch.query;
	const polymarketIsPreview = isPolymarket && polymarketQuery.length === 0;

	const yahooQuery = isDeribitFull || isDeribitPrefix || isPolymarket ? "" : debouncedQuery;

	const { data: yahooResults = [], isLoading: yahooLoading } = useSearch(yahooQuery);
	const { data: deribitResults = [], isLoading: deribitLoading } = useDeribitSearch(deribitQuery);
	const { data: deribitPreview = [], isLoading: deribitPreviewLoading } =
		useDeribitPreview(isDeribitPrefix);
	const { data: polymarketResults = [], isLoading: polymarketLoading } = usePolymarketSearch(
		isPolymarket && !polymarketIsPreview ? polymarketQuery : "",
	);
	const { data: polymarketPreview = [], isLoading: polymarketPreviewLoading } =
		usePolymarketPreview(polymarketIsPreview);

	const isDeribit = isDeribitFull || isDeribitPrefix;
	const polymarketRows = polymarketIsPreview ? polymarketPreview : polymarketResults;
	const polymarketLoadingState = polymarketIsPreview ? polymarketPreviewLoading : polymarketLoading;

	const tickerResults = isPolymarket
		? []
		: isDeribitFull
			? deribitResults
			: isDeribitPrefix
				? deribitPreview
				: yahooResults;

	const isLoading = isPolymarket
		? polymarketLoadingState
		: isDeribitFull
			? deribitLoading
			: isDeribitPrefix
				? deribitPreviewLoading
				: yahooLoading;

	const matchingSpecialItems = useMemo(() => {
		if (!query.trim() || isPolymarket) return [];
		const q = query.toLowerCase();
		return SPECIAL_ITEMS.filter(
			(item) => item.label?.toLowerCase().includes(q) || item.ticker.toLowerCase().includes(q),
		);
	}, [query, isPolymarket]);

	useEffect(() => {
		function handleClickOutside(e: MouseEvent) {
			if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
				setIsOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	useEffect(() => {
		function handleSlash(e: KeyboardEvent) {
			if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
				e.preventDefault();
				inputRef.current?.focus();
			}
		}
		document.addEventListener("keydown", handleSlash);
		return () => document.removeEventListener("keydown", handleSlash);
	}, []);

	const specialLabels = SPECIAL_ITEMS.map((i) => i.label?.split(" Live")[0])
		.filter(Boolean)
		.join(", ");
	const hasResults =
		matchingSpecialItems.length > 0 || tickerResults.length > 0 || polymarketRows.length > 0;

	const handlePolymarketSelect = (event: PolymarketSearchEvent) => {
		onSelect({
			ticker: event.slug,
			label: event.title,
			type: "Polymarket",
			source: "polymarket",
			currency: "USDC",
			polymarket: {
				eventId: event.id,
				slug: event.slug,
				title: event.title,
				image: event.image ?? event.icon,
			},
		});
		setQuery("");
		setDebouncedQuery("");
		setIsOpen(false);
	};

	return (
		<div ref={containerRef} className="relative">
			<div className="flex items-center gap-2 rounded-lg bg-[#1e1e2e] px-3 py-2">
				<Search className="h-4 w-4 text-zinc-500" />
				<input
					ref={inputRef}
					type="text"
					value={query}
					onChange={(e) => {
						setQuery(e.target.value);
						setIsOpen(true);
					}}
					onFocus={() => setIsOpen(true)}
					placeholder={placeholder}
					className="w-full bg-transparent text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
				/>
				{query && (
					<button
						type="button"
						onClick={() => {
							setQuery("");
							setDebouncedQuery("");
						}}
						className="text-zinc-500 hover:text-zinc-300"
					>
						<X className="h-3.5 w-3.5" />
					</button>
				)}
				<kbd className="hidden sm:inline-block rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-500">
					/
				</kbd>
			</div>

			{isOpen && (
				<div className="absolute z-50 mt-1 w-full rounded-lg border border-[#1e1e2e] bg-[#111118] shadow-xl">
					{/* Hint bar */}
					<div className="px-3 py-2 text-[11px] text-zinc-500 border-b border-[#1e1e2e]">
						Add tickers of ETFs, Crypto, Options (&quot;Deribit ...&quot;), Indexes, Polymarket
						events (&quot;polymarket ...&quot; or &quot;poly ...&quot;). Special items:{" "}
						{specialLabels}
					</div>

					{debouncedQuery && isLoading && matchingSpecialItems.length === 0 ? (
						<div className="px-3 py-4 text-center text-sm text-zinc-500">Searching...</div>
					) : debouncedQuery && !hasResults ? (
						<div className="px-3 py-4 text-center text-sm text-zinc-500">No results</div>
					) : hasResults ? (
						<ul className="max-h-72 overflow-y-auto py-1">
							{/* Special items */}
							{matchingSpecialItems.map((item) => (
								<li key={item.ticker}>
									<button
										type="button"
										onClick={() => {
											if (isCountdownItem(item) || isTargetsItem(item)) {
												onConfigureSpecial?.(item);
											} else {
												onSelect(item);
											}
											setQuery("");
											setDebouncedQuery("");
											setIsOpen(false);
										}}
										className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-[#1e1e2e]"
									>
										<div className="flex items-center gap-2">
											<span className="text-sm font-medium text-zinc-100">{item.label}</span>
										</div>
										<span
											className="rounded px-1.5 py-0.5 text-[10px] font-medium"
											style={{
												color:
													ASSET_TYPE_COLORS[
														(item.type ?? "Embed") as keyof typeof ASSET_TYPE_COLORS
													],
												backgroundColor: `${
													ASSET_TYPE_COLORS[
														(item.type ?? "Embed") as keyof typeof ASSET_TYPE_COLORS
													]
												}15`,
											}}
										>
											{item.type}
										</span>
									</button>
								</li>
							))}

							{/* Polymarket results */}
							{isPolymarket &&
								polymarketRows.slice(0, 10).map((event) => (
									<li key={event.id}>
										<button
											type="button"
											onClick={() => handlePolymarketSelect(event)}
											className="flex w-full items-start gap-2 px-3 py-2 text-left hover:bg-[#1e1e2e]"
										>
											{event.image || event.icon ? (
												<img
													src={event.image ?? event.icon}
													alt=""
													className="mt-0.5 h-6 w-6 shrink-0 rounded object-cover"
												/>
											) : (
												<div className="mt-0.5 h-6 w-6 shrink-0 rounded bg-zinc-800" />
											)}
											<div className="min-w-0 flex-1">
												<div className="text-sm font-medium text-zinc-100 line-clamp-2">
													{event.title}
												</div>
											</div>
											<span
												className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium"
												style={{
													color: ASSET_TYPE_COLORS.Polymarket,
													backgroundColor: `${ASSET_TYPE_COLORS.Polymarket}15`,
												}}
											>
												Polymarket
											</span>
										</button>
									</li>
								))}

							{/* Yahoo / Deribit results */}
							{!isPolymarket &&
								tickerResults.slice(0, 10).map((result) => (
									<li key={result.symbol}>
										<button
											type="button"
											onClick={() => {
												onSelect(
													isDeribit
														? {
																ticker: result.symbol,
																label: result.shortname,
																type: "Option",
																currency: "USDC",
																source: "deribit",
															}
														: {
																ticker: result.symbol,
																label: result.shortname,
																type: inferAssetType(result.quoteType),
																currency: "USD",
															},
												);
												setQuery("");
												setDebouncedQuery("");
												setIsOpen(false);
											}}
											className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-[#1e1e2e]"
										>
											<div className="flex items-center gap-2 min-w-0">
												<span
													className="text-sm font-medium text-zinc-100 truncate"
													title={isDeribit ? `Deribit ${result.symbol}` : result.symbol}
												>
													{isDeribit ? `Deribit ${result.symbol}` : result.symbol}
												</span>
												{!isDeribit && result.shortname !== result.symbol && (
													<span className="text-xs text-zinc-500 truncate max-w-45">
														{result.shortname}
													</span>
												)}
											</div>
											{isDeribit ? (
												<span
													className="rounded px-1.5 py-0.5 text-[10px] font-medium"
													style={{
														color: ASSET_TYPE_COLORS.Option,
														backgroundColor: `${ASSET_TYPE_COLORS.Option}15`,
													}}
												>
													Deribit
												</span>
											) : (
												<span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-500">
													{inferAssetType(result.quoteType)}
												</span>
											)}
										</button>
									</li>
								))}
						</ul>
					) : null}
				</div>
			)}
		</div>
	);
}
