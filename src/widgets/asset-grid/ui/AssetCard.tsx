"use client";

import {
	type DeribitTimeframe,
	useDeribitChart,
	useDeribitQuotes,
} from "@/entities/asset/api/deribit-queries";
import { useChart, useQuotes } from "@/entities/asset/api/queries";
import { inferAssetType } from "@/entities/asset/model/types";
import type { WatchlistItem } from "@/entities/watchlist/model/types";
import { TimeframeSelector } from "@/features/chart-timeframe/ui/TimeframeSelector";
import { ExternalLinks } from "@/features/external-links/ui/ExternalLinks";
import { ASSET_TYPE_COLORS, TIMEFRAME_INTERVALS, type Timeframe } from "@/shared/lib/constants";
import { formatPrice } from "@/shared/lib/format";
import { Liveline } from "liveline";
import { Expand } from "lucide-react";
import { useMemo, useState } from "react";

interface AssetCardProps {
	item: WatchlistItem;
	onOpenDetail?: () => void;
}

export function AssetCard({ item, onOpenDetail }: AssetCardProps) {
	const isDeribit = item.source === "deribit";
	const [timeframe, setTimeframe] = useState<Timeframe>(isDeribit ? "1D" : "1W");

	// Yahoo data
	const { data: yahooQuotes = [] } = useQuotes(
		isDeribit ? [] : ([item.ticker, item.futuresTicker].filter(Boolean) as string[]),
	);
	const { data: yahooChart = [], isLoading: yahooChartLoading } = useChart(
		isDeribit ? undefined : item.ticker,
		timeframe,
	);

	// Deribit data
	const deribitTimeframe = (
		["1D", "1W", "1M"].includes(timeframe) ? timeframe : "1D"
	) as DeribitTimeframe;
	const { data: deribitQuotes = [] } = useDeribitQuotes(isDeribit ? [item.ticker] : []);
	const { data: deribitChart = [], isLoading: deribitChartLoading } = useDeribitChart(
		isDeribit ? item.ticker : undefined,
		deribitTimeframe,
	);

	const chartData = isDeribit ? deribitChart : yahooChart;
	const chartLoading = isDeribit ? deribitChartLoading : yahooChartLoading;

	const spotQuote = yahooQuotes.find((q) => q.symbol === item.ticker);
	const futuresQuote =
		!isDeribit && item.futuresTicker
			? yahooQuotes.find((q) => q.symbol === item.futuresTicker)
			: null;
	const deribitQuote = isDeribit ? deribitQuotes.find((q) => q.symbol === item.ticker) : null;

	const lastChartValue = chartData.length > 0 ? chartData[chartData.length - 1].value : 0;
	const price = isDeribit
		? (deribitQuote?.markPrice ?? lastChartValue)
		: (spotQuote?.regularMarketPrice ?? lastChartValue);
	const changePercent = isDeribit ? 0 : (spotQuote?.regularMarketChangePercent ?? 0);
	const currencyLabel = isDeribit ? "USDC" : (spotQuote?.currency ?? item.currency ?? "USD");
	const currencyFormat = isDeribit ? "USD" : currencyLabel;
	const type = item.type ?? inferAssetType(spotQuote?.quoteType ?? "");

	const formatChartTime = useMemo(() => {
		return (t: number) => {
			const d = new Date(t * 1000);
			if (timeframe === "1D") {
				return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
			}
			if (timeframe === "1W") {
				const day = d.toLocaleDateString("en-US", { weekday: "short" });
				const h = d.getHours();
				const m = d.getMinutes();
				if (h === 0 && m === 0) return day;
				return `${day} ${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
			}
			return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
		};
	}, [timeframe]);

	const livelineData = useMemo(() => {
		if (chartData.length > 0) {
			return chartData.map((p) => ({ time: p.time / 1000, value: p.value }));
		}
		if (price > 0) {
			const now = Date.now() / 1000;
			const windowSecs = TIMEFRAME_INTERVALS[timeframe].windowSecs;
			// Generate synthetic flat-line points with micro-variance so
			// Liveline can resolve a valid Y-axis range.
			const steps = 12;
			const epsilon = price * 0.0001;
			return Array.from({ length: steps + 1 }, (_, i) => ({
				time: now - windowSecs + (windowSecs / steps) * i,
				value: price + (i === 0 ? -epsilon : i === steps ? epsilon : 0),
			}));
		}
		return [];
	}, [chartData, price, timeframe]);

	// Derive window from actual data span so the chart fills the full width,
	// instead of using a fixed calendar window that leaves empty space for
	// markets with limited trading hours.
	const chartWindow = useMemo(() => {
		if (livelineData.length >= 2) {
			const span = livelineData[livelineData.length - 1].time - livelineData[0].time;
			// Add 5% padding on each side
			return Math.ceil(span * 1.1);
		}
		return TIMEFRAME_INTERVALS[timeframe].windowSecs;
	}, [livelineData, timeframe]);

	return (
		<div
			className="rounded-xl border border-[#1e1e2e] bg-[#111118] p-3 flex flex-col gap-2 md:cursor-pointer"
			onDoubleClick={(e) => {
				// Skip double-click on touch/mobile — users have explicit buttons instead
				if (window.matchMedia("(pointer: coarse)").matches) return;
				onOpenDetail?.();
			}}
		>
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-1.5">
					<span
						className="flex items-center gap-1 rounded-sm bg-zinc-800/60 px-2 py-0.5 text-[10px] text-zinc-400"
						style={{
							color: ASSET_TYPE_COLORS[type as keyof typeof ASSET_TYPE_COLORS] ?? "#71717a",
						}}
					>
						{type}
					</span>
					<span className="flex items-center gap-1 rounded-sm bg-zinc-800/60 px-2 py-0.5 text-[10px] text-zinc-400">
						{currencyLabel}
					</span>
				</div>
				<button
					type="button"
					onClick={onOpenDetail}
					className="text-zinc-600 hover:text-zinc-300 transition-colors"
				>
					<Expand className="h-3.5 w-3.5" />
				</button>
			</div>

			{/* Ticker */}
			<div className="text-sm font-semibold text-zinc-100">{item.ticker}</div>

			{/* Chart */}
			<div className="h-25 w-full">
				<Liveline
					key={`${item.ticker}-${timeframe}`}
					data={livelineData}
					value={price}
					window={chartWindow}
					theme="dark"
					color={
						isDeribit
							? price > 0
								? "#22c55e"
								: "#ef4444"
							: changePercent >= 0
								? "#22c55e"
								: "#ef4444"
					}
					fill
					grid
					badge={false}
					loading={chartLoading}
					formatValue={(v) => formatPrice(v, currencyFormat)}
					formatTime={formatChartTime}
					scrub
					style={{ width: "100%", height: "100%" }}
				/>
			</div>

			{/* Timeframe selector */}
			<TimeframeSelector
				value={timeframe}
				onChange={setTimeframe}
				allowedTimeframes={isDeribit ? ["1D", "1W", "1M"] : undefined}
			/>

			{/* Prices */}
			<div className="space-y-0.5">
				{isDeribit ? (
					<>
						<div className="flex items-center justify-between">
							<span className="text-[11px] text-zinc-500">Mark</span>
							<div className="flex items-center gap-1.5">
								{deribitQuote && (
									<span className="text-[11px] tabular-nums text-zinc-400">
										{formatPrice(deribitQuote.bestBid, "USD")} /{" "}
										{formatPrice(deribitQuote.bestAsk, "USD")}
									</span>
								)}
								<span className="text-sm font-medium tabular-nums text-zinc-100">
									{price > 0 ? formatPrice(price, "USD") : "---"}
								</span>
							</div>
						</div>
						{deribitQuote && (
							<div className="flex items-center justify-between">
								<span className="text-[11px] text-zinc-500">IV</span>
								<span className="text-sm tabular-nums text-zinc-400">
									{deribitQuote.markIV.toFixed(1)}%
								</span>
							</div>
						)}
					</>
				) : (
					<>
						<div className="flex items-center justify-between">
							<span className="text-[11px] text-zinc-500">Spot</span>
							<div className="flex items-center gap-2">
								<span
									className={`text-[11px] tabular-nums ${changePercent >= 0 ? "text-emerald-500" : "text-red-500"}`}
								>
									{price > 0 ? `${changePercent >= 0 ? "+" : ""}${changePercent.toFixed(2)}%` : ""}
								</span>
								<span className="text-sm font-medium tabular-nums text-zinc-100">
									{price > 0 ? formatPrice(price, currencyFormat) : "---"}
								</span>
							</div>
						</div>
						{futuresQuote && (
							<div className="flex items-center justify-between">
								<span className="text-[11px] text-zinc-500">Futures</span>
								<span className="text-sm tabular-nums text-zinc-400">
									{formatPrice(futuresQuote.regularMarketPrice, futuresQuote.currency)}
								</span>
							</div>
						)}
					</>
				)}
			</div>

			{/* Footer */}
			<div className="flex items-center mt-auto justify-between py-1 pt-3 border-t border-[#1e1e2e]">
				<ExternalLinks ticker={item.ticker} source={item.source} />
				<button
					type="button"
					onClick={onOpenDetail}
					className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors"
				>
					Details
				</button>
			</div>
		</div>
	);
}
