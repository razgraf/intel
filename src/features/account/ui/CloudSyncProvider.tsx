"use client";

import { getEffectiveIsins } from "@/entities/isins/model/helpers";
import { useIsinsStore } from "@/entities/isins/model/store";
import {
	DEFAULT_WATCHLIST,
	useWatchlistHydrated,
	useWatchlistStore,
} from "@/entities/watchlist/model/store";
import type { WatchlistItem } from "@/entities/watchlist/model/types";
import { fetchCloudWatchlist, pushCloudWatchlist } from "@/features/account/lib/sync";
import { MigrateLocalModal } from "@/features/account/ui/MigrateLocalModal";
import { useAccountsEnabled } from "@/shared/lib/accounts-context";
import { useUser } from "@clerk/nextjs";
import { useEffect, useRef, useState } from "react";

const SYNC_DEBOUNCE_MS = 800;
const RETRY_DELAY_MS = 2000;

function stableStringify(items: unknown): string {
	return JSON.stringify(items);
}

function isDefaultWatchlist(items: { ticker: string }[]): boolean {
	return stableStringify(items) === stableStringify(DEFAULT_WATCHLIST);
}

function stripItemIsin(items: WatchlistItem[]): WatchlistItem[] {
	return items.map(({ isin: _isin, ...rest }) => rest);
}

function buildPushPayload(): {
	items: WatchlistItem[];
	isins: Record<string, string>;
} {
	const items = useWatchlistStore.getState().items;
	const master = useIsinsStore.getState().isins;
	return {
		items: stripItemIsin(items),
		isins: getEffectiveIsins(items, master),
	};
}

export function CloudSyncProvider() {
	const enabled = useAccountsEnabled();
	if (!enabled) return null;
	return <CloudSyncProviderInner />;
}

function CloudSyncProviderInner() {
	const { isLoaded, isSignedIn } = useUser();
	const hydrated = useWatchlistHydrated();
	const [migrateOpen, setMigrateOpen] = useState(false);
	const lastSyncedRef = useRef<string | null>(null);
	const wasSignedInRef = useRef<boolean | null>(null);

	// Effect A: hydrate from cloud on sign-in; reset to defaults on sign-out.
	useEffect(() => {
		if (!isLoaded || !hydrated) return;

		const prev = wasSignedInRef.current;
		wasSignedInRef.current = isSignedIn ?? false;

		// Sign-out transition: only act if we were previously signed in.
		if (prev === true && !isSignedIn) {
			useWatchlistStore.setState({ items: DEFAULT_WATCHLIST });
			useIsinsStore.getState().replace({});
			lastSyncedRef.current = null;
			return;
		}

		if (!isSignedIn) return;
		if (prev === true) return;

		let cancelled = false;
		(async () => {
			try {
				const cloud = await fetchCloudWatchlist();
				if (cancelled) return;

				if (cloud.items === null) {
					const local = useWatchlistStore.getState().items;
					if (local.length === 0 || isDefaultWatchlist(local)) {
						// Untouched / empty local: push silently, no prompt.
						try {
							const payload = buildPushPayload();
							await pushCloudWatchlist(payload.items, payload.isins);
							lastSyncedRef.current = stableStringify(payload);
						} catch (err) {
							console.warn("CloudSyncProvider: initial push failed", err);
						}
					} else {
						setMigrateOpen(true);
					}
				} else {
					// Cloud wins.
					useWatchlistStore.setState({ items: cloud.items });
					useIsinsStore.getState().replace(cloud.isins);
					lastSyncedRef.current = stableStringify({
						items: stripItemIsin(cloud.items),
						isins: cloud.isins,
					});
				}
			} catch (err) {
				console.warn("CloudSyncProvider: hydration failed", err);
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [isLoaded, isSignedIn, hydrated]);

	// Effect B: subscribe to BOTH stores; debounced push.
	useEffect(() => {
		if (!isSignedIn) return;

		let timeout: ReturnType<typeof setTimeout> | null = null;

		async function push(items: WatchlistItem[], isins: Record<string, string>, attempt = 1) {
			try {
				await pushCloudWatchlist(items, isins);
				lastSyncedRef.current = stableStringify({ items, isins });
			} catch (err) {
				console.warn(`CloudSyncProvider: push attempt ${attempt} failed`, err);
				if (attempt === 1) {
					setTimeout(() => push(items, isins, 2), RETRY_DELAY_MS);
				}
			}
		}

		function scheduleSync() {
			const payload = buildPushPayload();
			const next = stableStringify(payload);
			if (lastSyncedRef.current === next) return;
			if (timeout) clearTimeout(timeout);
			timeout = setTimeout(() => push(payload.items, payload.isins), SYNC_DEBOUNCE_MS);
		}

		const unsubItems = useWatchlistStore.subscribe((state, prev) => {
			if (state.items === prev.items) return;
			scheduleSync();
		});
		const unsubIsins = useIsinsStore.subscribe((state, prev) => {
			if (state.isins === prev.isins) return;
			scheduleSync();
		});

		return () => {
			unsubItems();
			unsubIsins();
			if (timeout) clearTimeout(timeout);
		};
	}, [isSignedIn]);

	return <MigrateLocalModal open={migrateOpen} />;
}
