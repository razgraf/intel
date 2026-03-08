"use client";

import { EXCHANGES, getExchangeStatus } from "@/shared/lib/exchanges";
import { formatLocalTime, getLocalTimezone } from "@/shared/lib/format";
import { AssetGrid } from "@/widgets/asset-grid/ui/AssetGrid";
import { AssetDetailSheet } from "@/widgets/asset-detail/ui/AssetDetailSheet";
import { EarningsPanel } from "@/widgets/earnings/ui/EarningsPanel";
import { MarketHoursPanel } from "@/widgets/market-hours/ui/MarketHoursPanel";
import { WatchlistPanel } from "@/widgets/watchlist/ui/WatchlistPanel";
import { TipsPanel } from "@/widgets/tips/ui/TipsPanel";
import { AnimatePresence, motion } from "framer-motion";
import { PanelRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export function DashboardLayout() {
  const [selectedTicker, setSelectedTicker] = useState<string | undefined>();
  const [detailTicker, setDetailTicker] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (detailTicker) setDetailTicker(null);
        else if (sidebarOpen) setSidebarOpen(false);
      }
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [detailTicker, sidebarOpen]);

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
          <button
            type="button"
            className="md:hidden ml-1 p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
            onClick={() => setSidebarOpen((o) => !o)}
            aria-label="Toggle sidebar"
          >
            <PanelRight className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 min-h-0">
        {/* Asset Grid */}
        <main className="flex-1 overflow-y-auto">
          <AssetGrid onOpenDetail={setDetailTicker} />
        </main>

        {/* Right sidebar — static on md+, slide-out drawer on <md */}
        <aside className="hidden md:flex w-80 border-l border-[#1e1e2e] flex-col shrink-0 overflow-hidden">
          <SidebarContent
            selectedTicker={selectedTicker}
            onSelect={setSelectedTicker}
            onOpenDetail={setDetailTicker}
          />
        </aside>

        {/* Mobile drawer */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                className="fixed inset-0 z-40 bg-black/60 md:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeSidebar}
              />
              <motion.aside
                className="fixed right-0 top-0 bottom-0 z-50 w-80 max-w-[85vw] bg-[#0a0a0f] border-l border-[#1e1e2e] flex flex-col overflow-hidden md:hidden"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
              >
                <SidebarContent
                  selectedTicker={selectedTicker}
                  onSelect={setSelectedTicker}
                  onOpenDetail={setDetailTicker}
                />
              </motion.aside>
            </>
          )}
        </AnimatePresence>
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

function SidebarContent({
  selectedTicker,
  onSelect,
  onOpenDetail,
}: {
  selectedTicker: string | undefined;
  onSelect: (ticker: string | undefined) => void;
  onOpenDetail: (ticker: string) => void;
}) {
  return (
    <>
      <div className="flex-1 overflow-y-auto overflow-x-hidden pt-2">
        <WatchlistPanel
          selectedTicker={selectedTicker}
          onSelect={onSelect}
          onOpenDetail={onOpenDetail}
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
    </>
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
