"use client";

import {
	DEFAULT_WATCHLIST,
	useWatchlistHydrated,
	useWatchlistStore,
} from "@/entities/watchlist/model/store";
import { fetchCloudWatchlist, pushCloudWatchlist } from "@/features/account/lib/sync";
import { MigrateLocalModal } from "@/features/account/ui/MigrateLocalModal";
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

export function CloudSyncProvider() {
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
			lastSyncedRef.current = null;
			return;
		}

		// Not signed in or no transition into signed-in — nothing to fetch.
		if (!isSignedIn) return;
		// Already handled this signed-in session.
		if (prev === true) return;

		let cancelled = false;
		(async () => {
			try {
				const cloud = await fetchCloudWatchlist();
				if (cancelled) return;

				if (cloud === null) {
					const local = useWatchlistStore.getState().items;
					if (local.length === 0 || isDefaultWatchlist(local)) {
						// Untouched / empty local: push defaults silently, no prompt.
						try {
							await pushCloudWatchlist(local);
							lastSyncedRef.current = stableStringify(local);
						} catch (err) {
							console.warn("CloudSyncProvider: initial push failed", err);
						}
					} else {
						setMigrateOpen(true);
					}
				} else {
					// Cloud wins.
					useWatchlistStore.setState({ items: cloud });
					lastSyncedRef.current = stableStringify(cloud);
				}
			} catch (err) {
				console.warn("CloudSyncProvider: hydration failed", err);
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [isLoaded, isSignedIn, hydrated]);

	// Effect B: subscribe to items mutations while signed in; debounce + push.
	useEffect(() => {
		if (!isSignedIn) return;

		let timeout: ReturnType<typeof setTimeout> | null = null;

		async function push(items: { ticker: string }[], attempt = 1) {
			try {
				await pushCloudWatchlist(items as never);
				lastSyncedRef.current = stableStringify(items);
			} catch (err) {
				console.warn(`CloudSyncProvider: push attempt ${attempt} failed`, err);
				if (attempt === 1) {
					setTimeout(() => push(items, 2), RETRY_DELAY_MS);
				}
			}
		}

		const unsubscribe = useWatchlistStore.subscribe((state, prev) => {
			if (state.items === prev.items) return;
			const next = stableStringify(state.items);
			if (lastSyncedRef.current === next) return;

			if (timeout) clearTimeout(timeout);
			timeout = setTimeout(() => push(state.items), SYNC_DEBOUNCE_MS);
		});

		return () => {
			unsubscribe();
			if (timeout) clearTimeout(timeout);
		};
	}, [isSignedIn]);

	return <MigrateLocalModal open={migrateOpen} />;
}
