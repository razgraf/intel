"use client";

import { DEFAULT_WATCHLIST, useWatchlistStore } from "@/entities/watchlist/model/store";
import { pushCloudWatchlist } from "@/features/account/lib/sync";
import { Dialog } from "@/shared/ui/Dialog";
import { Cloud, Trash2 } from "lucide-react";
import { useCallback, useState } from "react";

interface MigrateLocalModalProps {
	open: boolean;
}

export function MigrateLocalModal({ open }: MigrateLocalModalProps) {
	const items = useWatchlistStore((s) => s.items);
	const [busy, setBusy] = useState<"sync" | "discard" | null>(null);
	const [error, setError] = useState<string | null>(null);

	const handleSync = useCallback(async () => {
		setBusy("sync");
		setError(null);
		try {
			await pushCloudWatchlist(items);
			window.location.reload();
		} catch (err) {
			console.warn("MigrateLocalModal: sync failed", err);
			setError("Couldn't sync to cloud. Check your connection and try again.");
			setBusy(null);
		}
	}, [items]);

	const handleDiscard = useCallback(async () => {
		setBusy("discard");
		setError(null);
		try {
			useWatchlistStore.setState({ items: DEFAULT_WATCHLIST });
			await pushCloudWatchlist(DEFAULT_WATCHLIST);
			window.location.reload();
		} catch (err) {
			console.warn("MigrateLocalModal: discard failed", err);
			setError("Couldn't reset to defaults. Check your connection and try again.");
			setBusy(null);
		}
	}, []);

	// No onClose — forces a choice. Dialog's overlay click + Escape still fire it,
	// but with no setter wired it becomes a no-op.
	return (
		<Dialog open={open} onClose={() => {}}>
			<div className="p-5 space-y-4">
				<div className="space-y-1">
					<h2 className="text-sm font-semibold text-zinc-100">Sync your watchlist?</h2>
					<p className="text-xs text-zinc-400 leading-snug">
						You have <span className="text-zinc-200 font-medium">{items.length}</span>{" "}
						{items.length === 1 ? "item" : "items"} saved on this device. Sync them to your account
						so they're available on any device — or discard the local list and start from defaults.
					</p>
				</div>

				{error && (
					<div className="rounded-lg border border-red-500/30 bg-red-500/5 px-3 py-2">
						<p className="text-[11px] text-red-300">{error}</p>
					</div>
				)}

				<div className="flex flex-col gap-2">
					<button
						type="button"
						onClick={handleSync}
						disabled={busy !== null}
						className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-zinc-100 text-zinc-900 hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
					>
						<Cloud className="h-3.5 w-3.5" />
						{busy === "sync" ? "Syncing…" : "Sync to cloud"}
					</button>
					<button
						type="button"
						onClick={handleDiscard}
						disabled={busy !== null}
						className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs rounded-lg bg-zinc-800 text-zinc-200 hover:bg-zinc-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
					>
						<Trash2 className="h-3.5 w-3.5" />
						{busy === "discard" ? "Discarding…" : "Discard local"}
					</button>
				</div>
			</div>
		</Dialog>
	);
}
