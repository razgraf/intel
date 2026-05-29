"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface IsinsState {
	isins: Record<string, string>;
	set: (ticker: string, isin: string) => void;
	remove: (ticker: string) => void;
	replace: (next: Record<string, string>) => void;
}

export const useIsinsStore = create<IsinsState>()(
	persist(
		(set) => ({
			isins: {},
			set: (ticker, isin) => set((state) => ({ isins: { ...state.isins, [ticker]: isin } })),
			remove: (ticker) =>
				set((state) => {
					if (!(ticker in state.isins)) return state;
					const next = { ...state.isins };
					delete next[ticker];
					return { isins: next };
				}),
			replace: (next) => set({ isins: next }),
		}),
		{ name: "intel-isins" },
	),
);

export function useIsinsHydrated() {
	const [hydrated, setHydrated] = useState(false);
	useEffect(() => {
		const unsub = useIsinsStore.persist.onFinishHydration(() => setHydrated(true));
		if (useIsinsStore.persist.hasHydrated()) setHydrated(true);
		return unsub;
	}, []);
	return hydrated;
}
