"use client";

import { ArrowUpRight } from "lucide-react";

interface ExternalLinksProps {
	ticker: string;
	source?: "yahoo" | "deribit" | "youtube";
	quoteType?: string;
	className?: string;
}

function getTradingViewUrl(ticker: string): string {
	const clean = ticker.replace("-", "");
	return `https://www.tradingview.com/chart/?symbol=${clean}`;
}

function getYahooUrl(ticker: string): string {
	return `https://finance.yahoo.com/quote/${ticker}`;
}

function getUnusualWhalesUrl(ticker: string): string {
	return `https://unusualwhales.com/stock/${ticker}/insiders`;
}

function isUsStock(ticker: string, quoteType?: string): boolean {
	// US tickers are plain letters (AAPL, MSFT). Foreign tickers have an exchange
	// suffix (AZN.L, BHP.AX, 7203.T). Crypto pairs use a dash (BTC-USD).
	// UW only covers equities — exclude ETFs/funds/etc.
	if (ticker.includes(".") || ticker.includes("-")) return false;
	if (quoteType && quoteType.toUpperCase() !== "EQUITY") return false;
	return true;
}

function getDeribitUrl(instrumentName: string): string {
	const underlying = instrumentName.split("-")[0];
	return `https://www.deribit.com/options/${underlying}`;
}

const linkClass =
	"flex items-center gap-0.5 rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-500 hover:text-zinc-300 hover:bg-zinc-700 transition-colors";

export function ExternalLinks({ ticker, source, quoteType, className = "" }: ExternalLinksProps) {
	if (source === "deribit") {
		return (
			<div className={`flex items-center gap-1.5 ${className}`}>
				<a
					href={getDeribitUrl(ticker)}
					target="_blank"
					rel="noopener noreferrer"
					className={linkClass}
				>
					Deribit
					<ArrowUpRight className="h-2.5 w-2.5" />
				</a>
			</div>
		);
	}

	return (
		<div className={`flex items-center gap-1.5 ${className}`}>
			<a href={getYahooUrl(ticker)} target="_blank" rel="noopener noreferrer" className={linkClass}>
				Y!
				<ArrowUpRight className="h-2.5 w-2.5" />
			</a>
			<a
				href={getTradingViewUrl(ticker)}
				target="_blank"
				rel="noopener noreferrer"
				className={linkClass}
			>
				TW
				<ArrowUpRight className="h-2.5 w-2.5" />
			</a>
			{isUsStock(ticker, quoteType) && (
				<a
					href={getUnusualWhalesUrl(ticker)}
					target="_blank"
					rel="noopener noreferrer"
					className={linkClass}
				>
					UW
					<ArrowUpRight className="h-2.5 w-2.5" />
				</a>
			)}
		</div>
	);
}
