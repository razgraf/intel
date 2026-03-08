"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { WatchlistItem } from "./types";

interface WatchlistState {
  items: WatchlistItem[];
  add: (item: WatchlistItem) => void;
  remove: (ticker: string) => void;
  update: (ticker: string, patch: Partial<WatchlistItem>) => void;
  reorder: (items: WatchlistItem[]) => void;
}

const DEFAULT_WATCHLIST: WatchlistItem[] = [
  { ticker: "AAPL", label: "Apple", type: "Stock", currency: "USD" },
  { ticker: "VWCE.DE", label: "VWCE", type: "ETF", currency: "EUR" },
  { ticker: "BTC-USD", label: "Bitcoin", type: "Crypto", currency: "USD" },
  { ticker: "SNN.RO", label: "SNN.RO", type: "Stock", currency: "RON" },
];

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set) => ({
      items: DEFAULT_WATCHLIST,
      add: (item) =>
        set((state) => {
          if (state.items.some((i) => i.ticker === item.ticker)) return state;
          return { items: [...state.items, item] };
        }),
      remove: (ticker) =>
        set((state) => ({
          items: state.items.filter((i) => i.ticker !== ticker),
        })),
      update: (ticker, patch) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.ticker === ticker ? { ...i, ...patch } : i,
          ),
        })),
      reorder: (items) => set({ items }),
    }),
    { name: "intel-watchlist" },
  ),
);
