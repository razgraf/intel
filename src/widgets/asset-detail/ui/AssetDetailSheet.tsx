"use client";

import { useDeribitQuotes } from "@/entities/asset/api/deribit-queries";
import { useOptions, useQuotes } from "@/entities/asset/api/queries";
import { inferAssetType } from "@/entities/asset/model/types";
import { useWatchlistStore } from "@/entities/watchlist/model/store";
import { ExternalLinks } from "@/features/external-links/ui/ExternalLinks";
import { ASSET_TYPE_COLORS } from "@/shared/lib/constants";
import { formatPercent, formatPrice } from "@/shared/lib/format";
import { motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { AssetDetailChart } from "./AssetDetailChart";

const EASE_OUT_QUART = [0.165, 0.84, 0.44, 1] as const;

interface AssetDetailSheetProps {
	ticker: string;
	onClose: () => void;
}

export function AssetDetailSheet({ ticker, onClose }: AssetDetailSheetProps) {
	const shouldReduceMotion = useReducedMotion();
	const item = useWatchlistStore((s) => s.items.find((i) => i.ticker === ticker));
	const isDeribit = item?.source === "deribit";

	const allTickers = [ticker, item?.futuresTicker].filter(Boolean) as string[];
	const { data: quotes = [] } = useQuotes(isDeribit ? [] : allTickers);
	const { data: optionsData } = useOptions(isDeribit ? undefined : ticker);
	const { data: deribitQuotes = [] } = useDeribitQuotes(isDeribit ? [ticker] : []);

	const spotQuote = quotes.find((q) => q.symbol === ticker);
	const futuresQuote =
		!isDeribit && item?.futuresTicker ? quotes.find((q) => q.symbol === item.futuresTicker) : null;
	const deribitQuote = isDeribit ? deribitQuotes.find((q) => q.symbol === ticker) : null;

	const price = isDeribit ? (deribitQuote?.markPrice ?? 0) : (spotQuote?.regularMarketPrice ?? 0);
	const change = isDeribit ? 0 : (spotQuote?.regularMarketChange ?? 0);
	const changePercent = isDeribit ? 0 : (spotQuote?.regularMarketChangePercent ?? 0);
	const currency = isDeribit ? "USD" : (spotQuote?.currency ?? item?.currency ?? "USD");
	const type = item?.type ?? inferAssetType(spotQuote?.quoteType ?? "");

	// Average IV from first 5 ATM calls
	const avgIV =
		optionsData?.calls && optionsData.calls.length > 0
			? optionsData.calls
					.sort((a, b) => Math.abs(a.strike - price) - Math.abs(b.strike - price))
					.slice(0, 5)
					.reduce((sum, c) => sum + c.impliedVolatility, 0) / Math.min(5, optionsData.calls.length)
			: null;

	return (
		<motion.div
			className="fixed inset-0 z-50 flex justify-end"
			initial={shouldReduceMotion ? false : undefined}
			animate={undefined}
			exit={undefined}
		>
			<motion.div
				className="absolute inset-0 bg-black/60"
				onClick={onClose}
				onKeyDown={() => {}}
				role="presentation"
				initial={shouldReduceMotion ? false : { opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				transition={{ duration: 0.25, ease: EASE_OUT_QUART }}
			/>
			<motion.div
				className="relative w-[90vw] max-w-2xl bg-[#0a0a0f] border-l border-[#1e1e2e] overflow-y-auto"
				initial={shouldReduceMotion ? false : { x: "100%" }}
				animate={{ x: 0 }}
				exit={{ x: "100%" }}
				transition={{ duration: 0.25, ease: EASE_OUT_QUART }}
			>
				{/* Header */}
				<div className="sticky top-0 bg-[#0a0a0f]/95 backdrop-blur-sm border-b border-[#1e1e2e] p-4 flex items-start justify-between gap-3 z-10">
					<div className="flex flex-wrap items-center gap-2 min-w-0">
						<span className="text-lg font-semibold text-zinc-100 shrink-0">{ticker}</span>
						<span
							className="rounded-sm bg-zinc-800/60 px-2 py-0.5 text-[10px] text-zinc-400 shrink-0"
							style={{
								color: ASSET_TYPE_COLORS[type as keyof typeof ASSET_TYPE_COLORS] ?? "#71717a",
							}}
						>
							{type}
						</span>
						<span className="rounded-sm bg-zinc-800/60 px-2 py-0.5 text-[10px] text-zinc-400 shrink-0">
							{currency}
						</span>
						{isDeribit && (
							<span className="rounded-sm bg-zinc-800/60 px-2 py-0.5 text-[10px] text-emerald-400 shrink-0">
								Deribit
							</span>
						)}
						{spotQuote?.shortName && (
							<span className="text-sm text-zinc-500 truncate">{spotQuote.shortName}</span>
						)}
					</div>
					<button
						type="button"
						onClick={onClose}
						className="rounded-lg p-1 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
					>
						<X className="h-5 w-5" />
					</button>
				</div>

				<div className="p-4 space-y-6">
					{/* Price */}
					<div>
						<div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
							<span className="text-2xl md:text-3xl font-semibold tabular-nums text-zinc-100">
								{price > 0 ? formatPrice(price, currency) : "---"}
							</span>
							{!isDeribit && (
								<span
									className={`text-base md:text-lg tabular-nums ${changePercent >= 0 ? "text-emerald-500" : "text-red-500"}`}
								>
									{price > 0
										? `${formatPrice(change, currency)} (${formatPercent(changePercent)})`
										: ""}
								</span>
							)}
						</div>
					</div>

					{/* Chart */}
					<AssetDetailChart
						ticker={ticker}
						currency={currency}
						changePercent={changePercent}
						spotPrice={price}
						source={item?.source}
					/>

					{/* Stats grid */}
					<div className="grid grid-cols-2 gap-3">
						{isDeribit ? (
							<>
								{deribitQuote && (
									<>
										<StatRow label="Bid" value={deribitQuote.bestBid} currency="USD" />
										<StatRow label="Ask" value={deribitQuote.bestAsk} currency="USD" />
										<div className="rounded-lg bg-[#111118] p-3">
											<span className="text-[11px] text-zinc-500 block">IV</span>
											<span className="text-sm tabular-nums text-zinc-200">
												{deribitQuote.markIV.toFixed(1)}%
											</span>
										</div>
									</>
								)}
							</>
						) : (
							<>
								<StatRow label="Open" value={spotQuote?.regularMarketOpen} currency={currency} />
								<StatRow
									label="Prev Close"
									value={spotQuote?.regularMarketPreviousClose}
									currency={currency}
								/>
								<StatRow
									label="Day High"
									value={spotQuote?.regularMarketDayHigh}
									currency={currency}
								/>
								<StatRow
									label="Day Low"
									value={spotQuote?.regularMarketDayLow}
									currency={currency}
								/>
								<StatRow label="Volume" value={spotQuote?.regularMarketVolume} isVolume />
								{futuresQuote && (
									<StatRow
										label={`Futures (${item?.futuresTicker})`}
										value={futuresQuote.regularMarketPrice}
										currency={futuresQuote.currency}
									/>
								)}
								{avgIV !== null && (
									<div className="rounded-lg bg-[#111118] p-3">
										<span className="text-[11px] text-zinc-500 block">Avg IV (ATM)</span>
										<span className="text-sm tabular-nums text-zinc-200">
											{(avgIV * 100).toFixed(1)}%
										</span>
									</div>
								)}
							</>
						)}
					</div>

					{/* Links */}
					<div className="flex items-center justify-between pt-2 border-t border-[#1e1e2e]">
						<ExternalLinks ticker={ticker} source={item?.source} />
						{item?.notes && <p className="text-xs text-zinc-500 italic">{item.notes}</p>}
					</div>
				</div>
			</motion.div>
		</motion.div>
	);
}

function StatRow({
	label,
	value,
	currency,
	isVolume,
}: { label: string; value?: number; currency?: string; isVolume?: boolean }) {
	return (
		<div className="rounded-lg bg-[#111118] p-3">
			<span className="text-[11px] text-zinc-500 block">{label}</span>
			<span className="text-sm tabular-nums text-zinc-200">
				{value != null
					? isVolume
						? new Intl.NumberFormat("en-US", { notation: "compact" }).format(value)
						: formatPrice(value, currency)
					: "---"}
			</span>
		</div>
	);
}
