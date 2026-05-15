"use client";

import { useWatchlistStore } from "@/entities/watchlist/model/store";
import type { WatchlistItem } from "@/entities/watchlist/model/types";
import { Dialog } from "@/shared/ui/Dialog";
import { AlertTriangle, Check } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { decodeWatchlist } from "../lib/encode";

interface ValidatedItem {
	item: WatchlistItem;
	valid: boolean;
}

interface SourceConfig {
	match: (item: WatchlistItem) => boolean;
	skipValidation?: boolean;
	validate?: (items: WatchlistItem[]) => Promise<Set<string>>;
}

async function fetchValidSet(endpoint: string, items: WatchlistItem[]): Promise<Set<string>> {
	const tickers = items.map((i) => i.ticker).join(",");
	if (!tickers) return new Set();
	const res = await fetch(`${endpoint}?symbols=${encodeURIComponent(tickers)}`);
	const data: Array<{ symbol: string }> = await res.json();
	return new Set(Array.isArray(data) ? data.map((q) => q.symbol) : []);
}

const SOURCE_CONFIGS: Record<string, SourceConfig> = {
	embed: {
		match: (i) => i.type?.toLowerCase() === "embed",
		skipValidation: true,
	},
	countdown: {
		match: (i) => i.type?.toLowerCase() === "countdown",
		skipValidation: true,
	},
	targets: {
		match: (i) => i.type?.toLowerCase() === "targets",
		skipValidation: true,
	},
	deribit: {
		match: (i) => i.source === "deribit",
		validate: (items) => fetchValidSet("/api/deribit/quote", items),
	},
	yahoo: {
		match: () => true, // fallback
		validate: (items) => fetchValidSet("/api/market/quote", items),
	},
};

interface ImportWatchlistModalProps {
	externalPayload?: string | null;
	onExternalClose?: () => void;
}

function validatePayload(
	payload: string,
	callbacks: {
		onStart: () => void;
		onResult: (items: ValidatedItem[]) => void;
		onFinally: () => void;
		onEmpty: () => void;
	},
) {
	const decoded = decodeWatchlist(payload);
	if (!decoded || decoded.length === 0) {
		callbacks.onEmpty();
		return;
	}

	callbacks.onStart();

	const buckets = new Map<SourceConfig, WatchlistItem[]>();
	for (const item of decoded) {
		const config = Object.values(SOURCE_CONFIGS).find((c) => c.match(item));
		if (!config) continue;
		const list = buckets.get(config) ?? [];
		list.push(item);
		buckets.set(config, list);
	}

	const skippedTickers = new Set<string>();
	const validationPromises: Promise<Set<string>>[] = [];

	for (const [config, configItems] of buckets) {
		if (config.skipValidation) {
			for (const item of configItems) skippedTickers.add(item.ticker);
		} else if (config.validate) {
			validationPromises.push(
				config.validate(configItems).catch(() => new Set<string>(configItems.map((i) => i.ticker))),
			);
		}
	}

	Promise.all(validationPromises)
		.then((sets) => {
			const foundSet = new Set<string>(skippedTickers);
			for (const s of sets) for (const t of s) foundSet.add(t);

			const validated: ValidatedItem[] = decoded.map((item) => ({
				item,
				valid: foundSet.has(item.ticker),
			}));
			callbacks.onResult(validated);
		})
		.finally(() => callbacks.onFinally());
}

export function ImportWatchlistModal({
	externalPayload,
	onExternalClose,
}: ImportWatchlistModalProps = {}) {
	const [items, setItems] = useState<ValidatedItem[] | null>(null);
	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [isExternal, setIsExternal] = useState(false);
	const reorder = useWatchlistStore((s) => s.reorder);

	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const payload = params.get("watchlist");
		if (!payload) return;

		setIsExternal(false);
		setOpen(true);
		validatePayload(payload, {
			onStart: () => setLoading(true),
			onResult: (validated) => setItems(validated),
			onFinally: () => setLoading(false),
			onEmpty: () => clearParam(),
		});
	}, []);

	useEffect(() => {
		if (!externalPayload) return;

		setIsExternal(true);
		setItems(null);
		setOpen(true);
		validatePayload(externalPayload, {
			onStart: () => setLoading(true),
			onResult: (validated) => setItems(validated),
			onFinally: () => setLoading(false),
			onEmpty: () => {
				setOpen(false);
				onExternalClose?.();
			},
		});
	}, [externalPayload, onExternalClose]);

	const clearParam = useCallback(() => {
		const url = new URL(window.location.href);
		url.searchParams.delete("watchlist");
		history.replaceState(null, "", url.pathname + url.search);
	}, []);

	const handleRestore = useCallback(() => {
		if (!items) return;
		const valid = items.filter((i) => i.valid).map((i) => i.item);
		reorder(valid);
		if (isExternal) {
			onExternalClose?.();
		} else {
			clearParam();
		}
		setOpen(false);
	}, [items, reorder, clearParam, isExternal, onExternalClose]);

	const handleCancel = useCallback(() => {
		if (isExternal) {
			onExternalClose?.();
		} else {
			clearParam();
		}
		setOpen(false);
	}, [clearParam, isExternal, onExternalClose]);

	const validCount = items?.filter((i) => i.valid).length ?? 0;

	return (
		<Dialog open={open} onClose={handleCancel}>
			<div className="p-5">
				<h2 className="text-sm font-semibold text-zinc-100 mb-2">Restore Watchlist</h2>
				<p className="text-xs text-zinc-400 mb-4">
					You&apos;re trying to restore a watchlist from a link. This will override any existing
					items you&apos;re tracking on this browser.
				</p>

				{loading ? (
					<div className="text-xs text-zinc-500 py-4 text-center">Validating tickers...</div>
				) : (
					items && (
						<div className="space-y-1 mb-4 max-h-48 overflow-y-auto">
							{items.map(({ item, valid }) => (
								<div
									key={item.ticker}
									className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs ${
										valid ? "bg-zinc-800/50 text-zinc-200" : "bg-red-500/10 text-red-400"
									}`}
								>
									{valid ? (
										<Check className="h-3 w-3 text-emerald-400 shrink-0" />
									) : (
										<AlertTriangle className="h-3 w-3 text-red-400 shrink-0" />
									)}
									<span className="font-medium">{item.ticker}</span>
									{item.label && item.label !== item.ticker && (
										<span className="text-zinc-500">{item.label}</span>
									)}
									{item.type && (
										<span className="ml-auto text-[10px] text-zinc-600">{item.type}</span>
									)}
									{!valid && <span className="ml-auto text-[10px]">Not found</span>}
								</div>
							))}
						</div>
					)
				)}

				<div className="flex gap-2 justify-end">
					<button
						type="button"
						onClick={handleCancel}
						className="px-3 py-1.5 text-xs rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
					>
						Cancel
					</button>
					<button
						type="button"
						onClick={handleRestore}
						disabled={loading || validCount === 0}
						className="px-3 py-1.5 text-xs rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
					>
						Restore ({validCount})
					</button>
				</div>
			</div>
		</Dialog>
	);
}
