"use client";

import { useChartPreferencesStore } from "@/entities/chart-preferences/model/store";
import { useWatchlistStore } from "@/entities/watchlist/model/store";
import { encodeWatchlist } from "@/features/watchlist-sync/lib/encode";
import { ImportWatchlistModal } from "@/features/watchlist-sync/ui/ImportWatchlistModal";
import type { Timeframe } from "@/shared/lib/constants";
import { EXCHANGES, getExchangeStatus } from "@/shared/lib/exchanges";
import { formatLocalTime, getLocalTimezone } from "@/shared/lib/format";
import { Dialog } from "@/shared/ui/Dialog";
import { AssetDetailSheet } from "@/widgets/asset-detail/ui/AssetDetailSheet";
import { AssetGrid } from "@/widgets/asset-grid/ui/AssetGrid";
import { EventsPanel } from "@/widgets/earnings/ui/EarningsPanel";
import { MarketHoursPanel } from "@/widgets/market-hours/ui/MarketHoursPanel";
import { TipsPanel } from "@/widgets/tips/ui/TipsPanel";
import { WatchlistPanel } from "@/widgets/watchlist/ui/WatchlistPanel";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, Link, PanelRight, QrCode, Settings, X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useCallback, useEffect, useMemo, useState } from "react";

export function DashboardLayout() {
	const [selectedTicker, setSelectedTicker] = useState<string | undefined>();
	const [detailTicker, setDetailTicker] = useState<string | null>(null);
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [settingsOpen, setSettingsOpen] = useState(false);
	const [copied, setCopied] = useState(false);
	const [qrOpen, setQrOpen] = useState(false);
	const [localTime, setLocalTime] = useState("");
	const [timezone, setTimezone] = useState("");
	const watchlistItems = useWatchlistStore((s) => s.items);
	const resetAllTimeframes = useChartPreferencesStore((s) => s.resetAll);

	useEffect(() => {
		setLocalTime(formatLocalTime(new Date()));
		setTimezone(getLocalTimezone());
		const interval = setInterval(() => setLocalTime(formatLocalTime(new Date())), 60_000);
		return () => clearInterval(interval);
	}, []);

	const closeSidebar = useCallback(() => setSidebarOpen(false), []);

	const exportUrl = useMemo(() => {
		if (typeof window === "undefined") return "";
		const payload = encodeWatchlist(watchlistItems);
		return `${window.location.origin}${window.location.pathname}?watchlist=${payload}`;
	}, [watchlistItems]);

	const handleExport = useCallback(() => {
		navigator.clipboard.writeText(exportUrl).then(() => {
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		});
	}, [exportUrl]);

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
						className="ml-1 p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
						onClick={() => setSettingsOpen(true)}
						aria-label="Settings"
					>
						<Settings className="h-4 w-4" />
					</button>
					<button
						type="button"
						className="md:hidden p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
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
					<AssetDetailSheet ticker={detailTicker} onClose={() => setDetailTicker(null)} />
				)}
			</AnimatePresence>

			{/* Settings dialog */}
			<Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)}>
				<div className="p-5 space-y-4">
					<div className="flex items-center justify-between">
						<h2 className="text-sm font-semibold text-zinc-100">Settings</h2>
						<button
							type="button"
							onClick={() => setSettingsOpen(false)}
							className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
							aria-label="Close"
						>
							<X className="h-4 w-4" />
						</button>
					</div>

					<div className="space-y-2">
						<h3 className="text-[10px] uppercase font-bold text-zinc-500">Export Watchlist</h3>
						<div className="grid grid-cols-2 gap-2">
							<button
								type="button"
								onClick={handleExport}
								className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs rounded-lg bg-zinc-800 text-zinc-200 hover:bg-zinc-700 transition-colors"
							>
								{copied ? (
									<>
										<Check className="h-3.5 w-3.5 text-emerald-400" />
										Copied!
									</>
								) : (
									<>
										<Link className="h-3.5 w-3.5" />
										URL
									</>
								)}
							</button>
							<button
								type="button"
								onClick={() => setQrOpen(true)}
								className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs rounded-lg bg-zinc-800 text-zinc-200 hover:bg-zinc-700 transition-colors"
							>
								<QrCode className="h-3.5 w-3.5" />
								QR Code
							</button>
						</div>
					</div>

					<div className="space-y-2">
						<h3 className="text-[10px] uppercase font-bold text-zinc-500">Reset Time View</h3>
						<div className="grid grid-cols-3 gap-2">
							{(["1D", "1W", "1M"] as const).map((tf) => (
								<button
									key={tf}
									type="button"
									onClick={() => resetAllTimeframes(tf as Timeframe, watchlistItems)}
									className="flex items-center justify-center px-3 py-2 text-xs rounded-lg bg-zinc-800 text-zinc-200 hover:bg-zinc-700 transition-colors"
								>
									{tf}
								</button>
							))}
						</div>
					</div>

					<div className="rounded-lg border border-[#1e1e2e] bg-[#111118] p-3 space-y-2">
						<h3 className="text-[10px] uppercase font-bold text-zinc-500">Technical Details</h3>
						<dl className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 text-[11px]">
							<dt className="text-zinc-500">Polling interval</dt>
							<dd className="text-zinc-300 text-right tabular-nums">60s</dd>
							<dt className="text-zinc-500">Chart cache (stale time)</dt>
							<dd className="text-zinc-300 text-right tabular-nums">60s</dd>
							<dt className="text-zinc-500">Search cache</dt>
							<dd className="text-zinc-300 text-right tabular-nums">30s</dd>
							<dt className="text-zinc-500">Options cache</dt>
							<dd className="text-zinc-300 text-right tabular-nums">120s</dd>
							<dt className="text-zinc-500">Earnings cache</dt>
							<dd className="text-zinc-300 text-right tabular-nums">6h</dd>
							<dt className="text-zinc-500">Deribit preview cache</dt>
							<dd className="text-zinc-300 text-right tabular-nums">5m</dd>
							<dt className="text-zinc-500">Watchlist items</dt>
							<dd className="text-zinc-300 text-right tabular-nums">{watchlistItems.length}</dd>
						</dl>
					</div>
				</div>
			</Dialog>

			{/* QR code dialog */}
			<Dialog open={qrOpen} onClose={() => setQrOpen(false)}>
				<div className="p-5 space-y-4">
					<div className="flex items-center justify-between">
						<h2 className="text-sm font-semibold text-zinc-100">QR Code</h2>
						<button
							type="button"
							onClick={() => setQrOpen(false)}
							className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
							aria-label="Close"
						>
							<X className="h-4 w-4" />
						</button>
					</div>
					<div className="flex justify-center">
						<div className="rounded-lg border border-[#1e1e2e] bg-white p-3">
							<QRCodeSVG
								value={exportUrl}
								size={256}
								bgColor="#ffffff"
								fgColor="#0a0a0f"
								level="L"
							/>
						</div>
					</div>
					<p className="text-[10px] text-zinc-600 text-center">
						Scan to import this watchlist on another device
					</p>
				</div>
			</Dialog>

			{/* Import from URL */}
			<ImportWatchlistModal />
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
				<EventsPanel />
			</div>
			<div className="border-t border-[#1e1e2e] shrink-0">
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
							status.isOpen ? "bg-emerald-500/10 text-emerald-400" : "bg-zinc-800 text-zinc-500"
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
