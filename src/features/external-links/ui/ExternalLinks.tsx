"use client";

import { ArrowUpRight } from "lucide-react";

interface ExternalLinksProps {
  ticker: string;
  className?: string;
}

function getTradingViewUrl(ticker: string): string {
  const clean = ticker.replace("-", "");
  return `https://www.tradingview.com/chart/?symbol=${clean}`;
}

function getYahooUrl(ticker: string): string {
  return `https://finance.yahoo.com/quote/${ticker}`;
}

export function ExternalLinks({ ticker, className = "" }: ExternalLinksProps) {
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <a
        href={getYahooUrl(ticker)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-0.5 rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-500 hover:text-zinc-300 hover:bg-zinc-700 transition-colors"
      >
        Yahoo
        <ArrowUpRight className="h-2.5 w-2.5" />
      </a>
      <a
        href={getTradingViewUrl(ticker)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-0.5 rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-500 hover:text-zinc-300 hover:bg-zinc-700 transition-colors"
      >
        TW
        <ArrowUpRight className="h-2.5 w-2.5" />
      </a>
    </div>
  );
}
