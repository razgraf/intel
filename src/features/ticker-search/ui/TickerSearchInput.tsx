"use client";

import { useSearch } from "@/entities/asset/api/queries";
import { inferAssetType } from "@/entities/asset/model/types";
import type { WatchlistItem } from "@/entities/watchlist/model/types";
import { ASSET_TYPE_COLORS } from "@/shared/lib/constants";
import { SPECIAL_ITEMS } from "@/shared/lib/special-items";
import { Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

interface TickerSearchInputProps {
	onSelect: (item: WatchlistItem) => void;
	placeholder?: string;
}

export function TickerSearchInput({ onSelect, placeholder = "Search ticker..." }: TickerSearchInputProps) {
	const [query, setQuery] = useState("");
	const [debouncedQuery, setDebouncedQuery] = useState("");
	const [isOpen, setIsOpen] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const timer = setTimeout(() => setDebouncedQuery(query), 300);
		return () => clearTimeout(timer);
	}, [query]);

	const { data: results = [], isLoading } = useSearch(debouncedQuery);

	const matchingSpecialItems = useMemo(() => {
		if (!query.trim()) return [];
		const q = query.toLowerCase();
		return SPECIAL_ITEMS.filter(
			(item) =>
				item.label?.toLowerCase().includes(q) ||
				item.ticker.toLowerCase().includes(q),
		);
	}, [query]);

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

	const specialLabels = SPECIAL_ITEMS.map((i) => i.label).filter(Boolean).join(", ");
	const hasResults = matchingSpecialItems.length > 0 || results.length > 0;

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
					<button type="button" onClick={() => { setQuery(""); setDebouncedQuery(""); }} className="text-zinc-500 hover:text-zinc-300">
						<X className="h-3.5 w-3.5" />
					</button>
				)}
				<kbd className="hidden sm:inline-block rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-500">/</kbd>
			</div>

			{isOpen && (
				<div className="absolute z-50 mt-1 w-full rounded-lg border border-[#1e1e2e] bg-[#111118] shadow-xl">
					{/* Hint bar */}
					<div className="px-3 py-2 text-[11px] text-zinc-500 border-b border-[#1e1e2e]">
						Add tickers of ETFs, Crypto, Options, and Indexes or special items: {specialLabels}
					</div>

					{debouncedQuery && isLoading && matchingSpecialItems.length === 0 ? (
						<div className="px-3 py-4 text-center text-sm text-zinc-500">Searching...</div>
					) : debouncedQuery && !hasResults ? (
						<div className="px-3 py-4 text-center text-sm text-zinc-500">No results</div>
					) : hasResults ? (
						<ul className="max-h-64 overflow-y-auto py-1">
							{/* Special items */}
							{matchingSpecialItems.map((item) => (
								<li key={item.ticker}>
									<button
										type="button"
										onClick={() => {
											onSelect(item);
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
												color: ASSET_TYPE_COLORS.Embed,
												backgroundColor: `${ASSET_TYPE_COLORS.Embed}15`,
											}}
										>
											Embed
										</span>
									</button>
								</li>
							))}
							{/* API results */}
							{results.slice(0, 10).map((result) => (
								<li key={result.symbol}>
									<button
										type="button"
										onClick={() => {
											onSelect({
												ticker: result.symbol,
												label: result.shortname,
												type: inferAssetType(result.quoteType),
												currency: "USD",
											});
											setQuery("");
											setDebouncedQuery("");
											setIsOpen(false);
										}}
										className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-[#1e1e2e]"
									>
										<div className="flex items-center gap-2">
											<span className="text-sm font-medium text-zinc-100">{result.symbol}</span>
											<span className="text-xs text-zinc-500 truncate max-w-[180px]">{result.shortname}</span>
										</div>
										<span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-500">
											{inferAssetType(result.quoteType)}
										</span>
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
