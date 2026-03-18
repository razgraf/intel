"use client";

import { toTradingViewSymbol } from "@/shared/lib/tradingview";
import { useEffect, useRef } from "react";

interface TradingViewChartProps {
	ticker: string;
	type?: string;
}

export function TradingViewChart({ ticker, type }: TradingViewChartProps) {
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		const symbol = toTradingViewSymbol(ticker, type);

		const script = document.createElement("script");
		script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
		script.type = "text/javascript";
		script.async = true;
		script.textContent = JSON.stringify({
			symbol,
			theme: "dark",
			backgroundColor: "rgba(10, 10, 15, 1)",
			gridColor: "rgba(30, 30, 46, 1)",
			style: "1",
			locale: "en",
			hide_top_toolbar: false,
			hide_legend: true,
			allow_symbol_change: true,
			save_image: false,
			calendar: true,
			autosize: true,
		});

		container.appendChild(script);

		return () => {
			container.innerHTML = "";
		};
	}, [ticker, type]);

	return (
		<div className="h-100 w-full overflow-hidden rounded-lg">
			<div
				key={ticker}
				ref={containerRef}
				className="tradingview-widget-container"
				style={{ height: "100%", width: "100%" }}
			/>
		</div>
	);
}
