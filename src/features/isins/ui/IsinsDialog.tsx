"use client";

import { useSearch } from "@/entities/asset/api/queries";
import { getEffectiveIsins } from "@/entities/isins/model/helpers";
import { useIsinsStore } from "@/entities/isins/model/store";
import { useWatchlistStore } from "@/entities/watchlist/model/store";
import { Dialog } from "@/shared/ui/Dialog";
import { Flag, Plus, Search, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface IsinsDialogProps {
	open: boolean;
	onClose: () => void;
}

interface DraftRow {
	id: string;
	ticker: string;
	isin: string;
}

const ISIN_RE = /^[A-Z0-9]{12}$/;
const REGIONAL_A = 0x1f1e6; // regional indicator symbol "A"

function makeRowId() {
	return Math.random().toString(36).slice(2);
}

/**
 * Convert the ISO 3166-1 alpha-2 country code at the start of an ISIN into
 * a flag emoji (e.g. "US..." → 🇺🇸). Returns null when the first 2 chars
 * aren't alphabetic. Unrecognized 2-letter codes (e.g. "XS" supranational)
 * still get emitted — the OS picks the glyph or falls back to RI letters.
 */
function isinToFlag(isin: string): string | null {
	const code = isin.trim().toUpperCase().slice(0, 2);
	if (!/^[A-Z]{2}$/.test(code)) return null;
	const a = REGIONAL_A + (code.charCodeAt(0) - 0x41);
	const b = REGIONAL_A + (code.charCodeAt(1) - 0x41);
	return String.fromCodePoint(a) + String.fromCodePoint(b);
}

export function IsinsDialog({ open, onClose }: IsinsDialogProps) {
	const items = useWatchlistStore((s) => s.items);
	const masterIsins = useIsinsStore((s) => s.isins);
	const replace = useIsinsStore((s) => s.replace);
	const update = useWatchlistStore((s) => s.update);
	const [rows, setRows] = useState<DraftRow[]>([]);
	const [activeRowId, setActiveRowId] = useState<string | null>(null);

	// Build draft from effective ISINs whenever the dialog opens.
	useEffect(() => {
		if (!open) return;
		const effective = getEffectiveIsins(items, masterIsins);
		const seeded: DraftRow[] = Object.entries(effective).map(([ticker, isin]) => ({
			id: makeRowId(),
			ticker,
			isin,
		}));
		seeded.sort((a, b) => a.ticker.localeCompare(b.ticker));
		setRows(seeded);
		setActiveRowId(null);
	}, [open, items, masterIsins]);

	const setRow = useCallback((id: string, patch: Partial<DraftRow>) => {
		setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
	}, []);

	const removeRow = useCallback((id: string) => {
		setRows((prev) => prev.filter((r) => r.id !== id));
	}, []);

	const addRow = useCallback(() => {
		const row: DraftRow = { id: makeRowId(), ticker: "", isin: "" };
		setRows((prev) => [...prev, row]);
		setActiveRowId(row.id);
	}, []);

	const handleSave = useCallback(() => {
		// Normalize: trim/upper, drop empty tickers.
		const cleaned: Record<string, string> = {};
		for (const row of rows) {
			const t = row.ticker.trim().toUpperCase();
			const i = row.isin.trim().toUpperCase();
			if (!t) continue; // empty ticker → drop
			if (!i) continue; // empty ISIN → omit (effectively removes entry)
			cleaned[t] = i; // duplicates: last write wins
		}
		replace(cleaned);

		// Clear any legacy item.isin so it doesn't resurface via the fallback after
		// a removal from the master list.
		for (const item of items) {
			if (item.isin) update(item.ticker, { isin: undefined });
		}

		onClose();
	}, [rows, replace, items, update, onClose]);

	const invalidCount = useMemo(
		() =>
			rows.filter((r) => {
				const i = r.isin.trim().toUpperCase();
				return r.ticker.trim() && i && !ISIN_RE.test(i);
			}).length,
		[rows],
	);

	return (
		<Dialog open={open} onClose={onClose} className="max-w-lg">
			<div className="flex items-center justify-between p-5 pb-3">
				<h2 className="text-sm font-semibold text-zinc-100">ISINs</h2>
				<button
					type="button"
					onClick={onClose}
					className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
					aria-label="Close"
				>
					<X className="h-4 w-4" />
				</button>
			</div>

			<div className="px-5 pb-5 space-y-3">
				<p className="text-[11px] text-zinc-500 leading-snug">
					Maintain ISIN codes independently from the watchlist. Entries persist even if you remove
					their ticker from the watchlist.
				</p>

				<div className="max-h-72 overflow-y-auto space-y-1.5 pr-1">
					{rows.length === 0 ? (
						<p className="text-[11px] text-zinc-600 py-4 text-center">No ISINs yet.</p>
					) : (
						rows.map((row) => (
							<IsinRow
								key={row.id}
								row={row}
								watchlistTickers={items.map((i) => i.ticker)}
								active={activeRowId === row.id}
								onFocus={() => setActiveRowId(row.id)}
								onChange={(patch) => setRow(row.id, patch)}
								onRemove={() => removeRow(row.id)}
							/>
						))
					)}
				</div>

				<button
					type="button"
					onClick={addRow}
					className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-[#1e1e2e] px-3 py-2 text-xs text-zinc-400 hover:border-zinc-700 hover:text-zinc-200 transition-colors"
				>
					<Plus className="h-3.5 w-3.5" />
					Add row
				</button>

				<div className="flex items-center justify-between gap-2 pt-1">
					<span className="text-[10px] text-amber-300">
						{invalidCount > 0
							? `${invalidCount} row${invalidCount > 1 ? "s have" : " has"} an invalid 12-char ISIN`
							: ""}
					</span>
					<div className="flex items-center gap-2">
						<button
							type="button"
							onClick={onClose}
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
			</div>
		</Dialog>
	);
}

interface IsinRowProps {
	row: DraftRow;
	watchlistTickers: string[];
	active: boolean;
	onFocus: () => void;
	onChange: (patch: Partial<DraftRow>) => void;
	onRemove: () => void;
}

function IsinRow({ row, watchlistTickers, active, onFocus, onChange, onRemove }: IsinRowProps) {
	const [showDropdown, setShowDropdown] = useState(false);
	const [debouncedTicker, setDebouncedTicker] = useState("");
	const inputWrapperRef = useRef<HTMLDivElement>(null);
	const [dropdownCoords, setDropdownCoords] = useState<{
		top: number;
		left: number;
		width: number;
	} | null>(null);

	useEffect(() => {
		const trimmed = row.ticker.trim();
		if (!active || trimmed.length < 1) {
			setDebouncedTicker("");
			return;
		}
		const t = setTimeout(() => setDebouncedTicker(trimmed), 300);
		return () => clearTimeout(t);
	}, [row.ticker, active]);

	const localMatches = useMemo(() => {
		const q = row.ticker.trim().toUpperCase();
		if (!q) return [];
		return watchlistTickers.filter((t) => t.startsWith(q) && t !== q).slice(0, 5);
	}, [row.ticker, watchlistTickers]);

	const yahooQuery = localMatches.length === 0 ? debouncedTicker : "";
	const { data: yahooResults = [], isLoading: searching } = useSearch(yahooQuery);

	const isinUpper = row.isin.trim().toUpperCase();
	const isinIsInvalid = isinUpper.length > 0 && !ISIN_RE.test(isinUpper);

	const dropdownVisible =
		active && showDropdown && (localMatches.length > 0 || (yahooQuery && yahooResults.length > 0));

	useEffect(() => {
		if (!dropdownVisible) {
			setDropdownCoords(null);
			return;
		}
		function update() {
			const el = inputWrapperRef.current;
			if (!el) return;
			const r = el.getBoundingClientRect();
			setDropdownCoords({ top: r.bottom + 4, left: r.left, width: r.width });
		}
		update();
		window.addEventListener("scroll", update, true);
		window.addEventListener("resize", update);
		return () => {
			window.removeEventListener("scroll", update, true);
			window.removeEventListener("resize", update);
		};
	}, [dropdownVisible]);

	const closeDropdown = () => {
		setShowDropdown(false);
	};

	return (
		<div className="space-y-1.5">
			<div className="flex items-center gap-1.5">
				<div ref={inputWrapperRef} className="relative flex-1">
					<div className="flex items-center gap-2 rounded-lg bg-[#1e1e2e] px-2.5 py-1.5">
						<Search className="h-3 w-3 text-zinc-500 shrink-0" />
						<input
							type="text"
							value={row.ticker}
							onChange={(e) => {
								onChange({ ticker: e.target.value.toUpperCase() });
								setShowDropdown(true);
							}}
							onFocus={() => {
								onFocus();
								setShowDropdown(true);
							}}
							onBlur={() => {
								// Delay so a click on a dropdown item registers.
								setTimeout(closeDropdown, 150);
							}}
							placeholder="Ticker (e.g. AAPL)"
							className="w-full bg-transparent text-xs text-zinc-100 outline-none placeholder:text-zinc-500"
						/>
					</div>
					{dropdownVisible &&
						dropdownCoords &&
						createPortal(
							<div
								style={{
									position: "fixed",
									top: dropdownCoords.top,
									left: dropdownCoords.left,
									width: dropdownCoords.width,
									zIndex: 60,
								}}
								className="rounded-lg border border-[#1e1e2e] bg-[#18181b] shadow-xl max-h-40 overflow-y-auto"
							>
								{localMatches.length > 0 && (
									<ul className="py-1">
										{localMatches.map((t) => (
											<li key={t}>
												<button
													type="button"
													onMouseDown={(e) => e.preventDefault()}
													onClick={() => {
														onChange({ ticker: t });
														closeDropdown();
													}}
													className="flex w-full items-center justify-between px-3 py-1.5 text-left hover:bg-[#1e1e2e] transition-colors"
												>
													<span className="text-xs font-medium text-zinc-100">{t}</span>
													<span className="text-[10px] text-zinc-600">in watchlist</span>
												</button>
											</li>
										))}
									</ul>
								)}
								{searching && yahooQuery && (
									<div className="px-3 py-2 text-center text-[10px] text-zinc-500">Searching…</div>
								)}
								{yahooQuery && yahooResults.length > 0 && (
									<ul className="py-1">
										{yahooResults.slice(0, 6).map((r) => (
											<li key={r.symbol}>
												<button
													type="button"
													onMouseDown={(e) => e.preventDefault()}
													onClick={() => {
														onChange({ ticker: r.symbol });
														closeDropdown();
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
							</div>,
							document.body,
						)}
				</div>

				<div
					className={`w-44 flex items-center gap-2 rounded-lg bg-[#1e1e2e] px-2.5 py-1.5 focus-within:ring-1 ${isinIsInvalid ? "ring-1 ring-red-500/50 focus-within:ring-red-500" : "focus-within:ring-zinc-600"}`}
				>
					<span className="shrink-0 leading-none">
						{(() => {
							const flag = isinToFlag(row.isin);
							return flag ? (
								<span className="text-sm">{flag}</span>
							) : (
								<Flag className="h-3.5 w-3.5 text-zinc-600" />
							);
						})()}
					</span>
					<input
						type="text"
						value={row.isin}
						onChange={(e) => onChange({ isin: e.target.value.toUpperCase() })}
						onFocus={onFocus}
						maxLength={12}
						placeholder="ISIN (12 chars)"
						className="flex-1 bg-transparent text-xs tabular-nums text-zinc-100 outline-none placeholder:text-zinc-500"
					/>
				</div>

				<button
					type="button"
					onClick={onRemove}
					className="p-1.5 rounded text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors"
					aria-label="Remove row"
				>
					<Trash2 className="h-3.5 w-3.5" />
				</button>
			</div>
		</div>
	);
}
