"use client";

import { EXCHANGES, getExchangeStatus } from "@/shared/lib/exchanges";
import { formatLocalTime, getLocalTimezone } from "@/shared/lib/format";
import { AssetGrid } from "@/widgets/asset-grid/ui/AssetGrid";
import { AssetDetailSheet } from "@/widgets/asset-detail/ui/AssetDetailSheet";
import { EarningsPanel } from "@/widgets/earnings/ui/EarningsPanel";
import { MarketHoursPanel } from "@/widgets/market-hours/ui/MarketHoursPanel";
import { WatchlistPanel } from "@/widgets/watchlist/ui/WatchlistPanel";
import { TipsPanel } from "@/widgets/tips/ui/TipsPanel";
import { AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export function DashboardLayout() {
  const [selectedTicker, setSelectedTicker] = useState<string | undefined>();
  const [detailTicker, setDetailTicker] = useState<string | null>(null);
  const [localTime, setLocalTime] = useState("");
  const [timezone, setTimezone] = useState("");

  useEffect(() => {
    setLocalTime(formatLocalTime(new Date()));
    setTimezone(getLocalTimezone());
    const interval = setInterval(
      () => setLocalTime(formatLocalTime(new Date())),
      60_000,
    );
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape" && detailTicker) {
        setDetailTicker(null);
      }
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [detailTicker]);

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0f] text-zinc-100">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b border-[#1e1e2e] px-4 py-2 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-md font-bold tracking-tight">Intel</span>
        </div>

        {/* Exchange status pills */}
        <div className="hidden md:flex items-center gap-1.5">
          <ExchangeStatusPills />
        </div>

        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <span className="tabular-nums">{localTime}</span>
          <span>{timezone}</span>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 min-h-0">
        {/* Asset Grid */}
        <main className="flex-1 overflow-y-auto">
          <AssetGrid onOpenDetail={setDetailTicker} />
        </main>

        {/* Right sidebar */}
        <aside className="w-80 border-l border-[#1e1e2e] flex flex-col shrink-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto overflow-x-hidden pt-2">
            <WatchlistPanel
              selectedTicker={selectedTicker}
              onSelect={setSelectedTicker}
              onOpenDetail={setDetailTicker}
            />
          </div>
          <div className="border-t border-[#1e1e2e] shrink-0">
            <TipsPanel />
          </div>
          <div className="border-t border-[#1e1e2e] shrink-0">
            <EarningsPanel />
          </div>
          <div className="border-t border-[#1e1e2e] p-3 shrink-0">
            <MarketHoursPanel />
          </div>
        </aside>
      </div>

      {/* Detail sheet */}
      <AnimatePresence>
        {detailTicker && (
          <AssetDetailSheet
            ticker={detailTicker}
            onClose={() => setDetailTicker(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ExchangeStatusPills() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  if (!now) return null;

  return (
    <>
      {EXCHANGES.map((exchange) => {
        const status = getExchangeStatus(exchange, now);
        return (
          <div
            key={exchange.id}
            className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] ${
              status.isOpen
                ? "bg-emerald-500/10 text-emerald-400"
                : "bg-zinc-800 text-zinc-500"
            }`}
          >
            <div
              className={`h-1 w-1 rounded-full ${status.isOpen ? "bg-emerald-500" : "bg-zinc-600"}`}
            />
            {exchange.name}
          </div>
        );
      })}
    </>
  );
}
