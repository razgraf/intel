"use client";

import { type DeribitTimeframe, useDeribitChart } from "@/entities/asset/api/deribit-queries";
import { useChart } from "@/entities/asset/api/queries";
import { TimeframeSelector } from "@/features/chart-timeframe/ui/TimeframeSelector";
import { TIMEFRAME_INTERVALS, type Timeframe } from "@/shared/lib/constants";
import { formatPrice } from "@/shared/lib/format";
import { Liveline, LivelineTransition } from "liveline";
import type { CandlePoint } from "liveline";
import { BarChart3, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { TradingViewChart } from "./TradingViewChart";

const TV_SUPPORTED_TYPES: string[] = ["Stock", "ETF", "Crypto"];

interface AssetDetailChartProps {
	ticker: string;
	currency?: string;
	changePercent?: number;
	spotPrice?: number;
	source?: "yahoo" | "deribit" | "youtube";
	type?: string;
}

export function AssetDetailChart({
	ticker,
	currency = "USD",
	changePercent = 0,
	spotPrice = 0,
	source,
	type,
}: AssetDetailChartProps) {
	const isDeribit = source === "deribit";
	const [timeframe, setTimeframe] = useState<Timeframe>(isDeribit ? "1D" : "1M");
	const [mode, setMode] = useState<"line" | "candle">("line");

	const showTradingView = !isDeribit && !!type && TV_SUPPORTED_TYPES.includes(type);
	const [activeProvider, setActiveProvider] = useState<"native" | "tradingview">("native");

	const deribitTimeframe = (
		["1D", "1W", "1M"].includes(timeframe) ? timeframe : "1D"
	) as DeribitTimeframe;
	const { data: yahooChart = [], isLoading: yahooLoading } = useChart(
		isDeribit ? undefined : ticker,
		timeframe,
	);
	const { data: deribitChart = [], isLoading: deribitLoading } = useDeribitChart(
		isDeribit ? ticker : undefined,
		deribitTimeframe,
	);

	const chartData = isDeribit ? deribitChart : yahooChart;
	const isLoading = isDeribit ? deribitLoading : yahooLoading;

	const currentPrice = chartData[chartData.length - 1]?.value ?? spotPrice;

	const livelineData = useMemo(() => {
		if (chartData.length > 0) {
			return chartData.map((p) => ({ time: p.time / 1000, value: p.value }));
		}
		if (currentPrice > 0) {
			const now = Date.now() / 1000;
			const windowSecs = TIMEFRAME_INTERVALS[timeframe].windowSecs;
			const steps = 12;
			const epsilon = currentPrice * 0.0001;
			return Array.from({ length: steps + 1 }, (_, i) => ({
				time: now - windowSecs + (windowSecs / steps) * i,
				value: currentPrice + (i === 0 ? -epsilon : i === steps ? epsilon : 0),
			}));
		}
		return [];
	}, [chartData, currentPrice, timeframe]);

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

	const chartWindow = useMemo(() => {
		if (livelineData.length >= 2) {
			const now = Date.now() / 1000;
			const dataSpan = livelineData[livelineData.length - 1].time - livelineData[0].time;
			const fullSpan = now - livelineData[0].time;
			return Math.ceil(Math.max(dataSpan, fullSpan) * 1.1);
		}
		return TIMEFRAME_INTERVALS[timeframe].windowSecs;
	}, [livelineData, timeframe]);

	const candleData: CandlePoint[] = useMemo(
		() =>
			chartData.map((p) => ({
				time: p.time / 1000,
				open: (p as { open?: number }).open ?? p.value,
				high: (p as { high?: number }).high ?? p.value,
				low: (p as { low?: number }).low ?? p.value,
				close: p.value,
			})),
		[chartData],
	);

	return (
		<div className="space-y-3">
			{showTradingView && <ProviderTabs active={activeProvider} onChange={setActiveProvider} />}

			{activeProvider === "tradingview" ? (
				<TradingViewChart ticker={ticker} type={type} />
			) : (
				<>
					<div className="flex items-center justify-between">
						<TimeframeSelector
							value={timeframe}
							onChange={setTimeframe}
							size="md"
							allowedTimeframes={isDeribit ? ["1D", "1W", "1M"] : undefined}
						/>
						<div className="flex items-center gap-1 rounded-lg bg-zinc-800 p-0.5">
							<button
								type="button"
								onClick={() => setMode("line")}
								className={`rounded p-1 transition-colors ${mode === "line" ? "bg-zinc-700 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"}`}
							>
								<TrendingUp className="h-3.5 w-3.5" />
							</button>
							<button
								type="button"
								onClick={() => setMode("candle")}
								className={`rounded p-1 transition-colors ${mode === "candle" ? "bg-zinc-700 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"}`}
							>
								<BarChart3 className="h-3.5 w-3.5" />
							</button>
						</div>
					</div>

					<div className="h-100 w-full">
						<LivelineTransition active={mode}>
							<Liveline
								key="line"
								data={livelineData}
								value={currentPrice}
								window={chartWindow}
								theme="dark"
								color={changePercent >= 0 ? "#22c55e" : "#ef4444"}
								fill
								grid
								scrub
								loading={isLoading}
								formatValue={(v) => formatPrice(v, currency)}
								formatTime={formatChartTime}
								style={{ width: "100%", height: "100%" }}
							/>
							<Liveline
								key="candle"
								data={livelineData}
								value={currentPrice}
								window={chartWindow}
								mode="candle"
								candles={candleData}
								theme="dark"
								grid
								scrub
								loading={isLoading}
								formatValue={(v) => formatPrice(v, currency)}
								formatTime={formatChartTime}
								style={{ width: "100%", height: "100%" }}
							/>
						</LivelineTransition>
					</div>
				</>
			)}
		</div>
	);
}

function ProviderTabs({
	active,
	onChange,
}: { active: "native" | "tradingview"; onChange: (p: "native" | "tradingview") => void }) {
	return (
		<div className="flex items-center gap-1 rounded-lg bg-zinc-800 p-0.5 w-fit">
			<button
				type="button"
				onClick={() => onChange("native")}
				className={`rounded px-2.5 py-1 text-xs transition-colors ${active === "native" ? "bg-zinc-700 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"}`}
			>
				Native
			</button>
			<button
				type="button"
				onClick={() => onChange("tradingview")}
				className={`rounded px-2.5 py-1 text-xs transition-colors ${active === "tradingview" ? "bg-zinc-700 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"}`}
			>
				TradingView
			</button>
		</div>
	);
}
