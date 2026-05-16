"use client";

import { useQuotes } from "@/entities/asset/api/queries";
import { isPriceableForTargets } from "@/entities/watchlist/model/helpers";
import { useWatchlistStore } from "@/entities/watchlist/model/store";
import type {
  TargetDirection,
  TargetRow,
} from "@/entities/watchlist/model/types";
import {
  MAX_TARGET_ROWS,
  adaptiveStep,
  getTargetDirection,
  roundToStep,
} from "@/shared/lib/targets";
import { Dialog } from "@/shared/ui/Dialog";
import {
  ChevronDown,
  ChevronUp,
  Plus,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

interface TargetsDialogProps {
  open: boolean;
  onClose: () => void;
  initialRows: TargetRow[];
  title?: string;
  onSave: (rows: TargetRow[]) => void;
}

interface DraftRow {
  ticker: string;
  priceInput: string;
  direction: TargetDirection;
}

function toDraft(row: TargetRow): DraftRow {
  return {
    ticker: row.ticker,
    priceInput: String(row.price),
    direction: getTargetDirection(row),
  };
}

export function TargetsDialog({
  open,
  onClose,
  initialRows,
  title = "Edit Targets",
  onSave,
}: TargetsDialogProps) {
  const items = useWatchlistStore((s) => s.items);
  const eligible = useMemo(() => items.filter(isPriceableForTargets), [items]);
  const eligibleTickers = useMemo(
    () => eligible.map((i) => i.ticker),
    [eligible],
  );
  const { data: quotes = [] } = useQuotes(eligibleTickers);
  const quoteMap = useMemo(
    () => new Map(quotes.map((q) => [q.symbol, q])),
    [quotes],
  );

  const [rows, setRows] = useState<DraftRow[]>([]);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      setRows(initialRows.map(toDraft));
    }
    wasOpenRef.current = open;
  }, [open, initialRows]);

  const canAdd = rows.length < MAX_TARGET_ROWS && eligible.length > 0;

  function addRow() {
    if (!canAdd) return;
    setRows((prev) => [
      ...prev,
      { ticker: eligible[0].ticker, priceInput: "", direction: "long" },
    ]);
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  function patchRow(index: number, patch: Partial<DraftRow>) {
    setRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, ...patch } : r)),
    );
  }

  function handleSave() {
    const parsed: TargetRow[] = [];
    for (const r of rows) {
      const price = Number(r.priceInput);
      if (!r.ticker || !Number.isFinite(price) || price <= 0) continue;
      parsed.push({ ticker: r.ticker, price, direction: r.direction });
    }
    onSave(parsed);
    onClose();
  }

  const validCount = rows.filter((r) => {
    const price = Number(r.priceInput);
    return r.ticker && Number.isFinite(price) && price > 0;
  }).length;

  return (
    <Dialog open={open} onClose={onClose}>
      <div className="p-4 space-y-4">
        <h3 className="text-sm font-semibold text-zinc-100">{title}</h3>

        <p className="text-[11px] text-zinc-500 leading-tight">
          Track up to {MAX_TARGET_ROWS} price targets across your watchlist.
          Pick the same ticker more than once for multiple levels. The card
          glows when any target is within 2%.
        </p>

        {eligible.length === 0 && (
          <div className="rounded-lg bg-amber-500/10 px-3 py-2 text-[11px] text-amber-300">
            Add at least one price-able ticker (stock, ETF, crypto, etc.) to
            your watchlist before creating targets.
          </div>
        )}

        <div className="space-y-2">
          {rows.map((row, index) => {
            const quote = quoteMap.get(row.ticker);
            const currency = quote?.currency ?? "USD";

            return (
              <div
                key={`${row.ticker}-${index}-${row.direction}`}
                className="flex items-center gap-1.5 rounded-lg bg-[#1e1e2e] px-2 py-1.5"
              >
                <select
                  value={row.ticker}
                  onChange={(e) => patchRow(index, { ticker: e.target.value })}
                  className="bg-transparent text-xs text-zinc-100 outline-none max-w-35"
                >
                  {eligible.map((opt) => (
                    <option
                      key={opt.ticker}
                      value={opt.ticker}
                      className="bg-[#1e1e2e]"
                    >
                      {opt.ticker}
                    </option>
                  ))}
                </select>
                <DirectionToggle
                  value={row.direction}
                  onChange={(direction) => patchRow(index, { direction })}
                />
                <TargetPriceInput
                  value={row.priceInput}
                  referencePrice={quote?.regularMarketPrice}
                  onChange={(next) => patchRow(index, { priceInput: next })}
                />
                <span className="text-[10px] text-zinc-500">{currency}</span>
                <button
                  type="button"
                  onClick={() => removeRow(index)}
                  className="rounded p-1 text-zinc-500 hover:bg-zinc-800 hover:text-red-400 transition-colors"
                  aria-label="Remove row"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={addRow}
          disabled={!canAdd}
          className="flex items-center gap-1.5 rounded-lg border border-dashed border-[#2a2a3a] px-3 py-1.5 text-[11px] text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus className="h-3 w-3" />
          Add row
          <span className="text-[10px] text-zinc-600">
            ({rows.length}/{MAX_TARGET_ROWS})
          </span>
        </button>

        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={validCount === 0 && initialRows.length === 0}
            className="rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-900 hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Save
          </button>
        </div>
      </div>
    </Dialog>
  );
}

interface DirectionToggleProps {
  value: TargetDirection;
  onChange: (next: TargetDirection) => void;
}

function DirectionToggle({ value, onChange }: DirectionToggleProps) {
  return (
    <div className="flex items-center gap-px rounded-md bg-zinc-900/60 p-0.5 shrink-0">
      <button
        type="button"
        onClick={() => onChange("long")}
        aria-pressed={value === "long"}
        aria-label="Long target"
        title="Long — expecting price to rise"
        className={`rounded-sm p-0.5 transition-colors ${
          value === "long"
            ? "bg-emerald-500/20 text-emerald-300"
            : "text-zinc-500 hover:text-zinc-300"
        }`}
      >
        <TrendingUp className="h-3 w-3" strokeWidth={2.5} />
      </button>
      <button
        type="button"
        onClick={() => onChange("short")}
        aria-pressed={value === "short"}
        aria-label="Short target"
        title="Short — expecting price to fall"
        className={`rounded-sm p-0.5 transition-colors ${
          value === "short"
            ? "bg-rose-500/20 text-rose-300"
            : "text-zinc-500 hover:text-zinc-300"
        }`}
      >
        <TrendingDown className="h-3 w-3" strokeWidth={2.5} />
      </button>
    </div>
  );
}

interface TargetPriceInputProps {
  value: string;
  referencePrice?: number;
  onChange: (next: string) => void;
}

function TargetPriceInput({
  value,
  referencePrice,
  onChange,
}: TargetPriceInputProps) {
  function stepBy(direction: 1 | -1) {
    const parsed = Number(value);
    const base =
      Number.isFinite(parsed) && parsed > 0 ? parsed : (referencePrice ?? 1);
    const step = adaptiveStep(base);
    const next = Math.max(0, roundToStep(base + step * direction, step));
    onChange(String(next));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      stepBy(1);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      stepBy(-1);
    }
  }

  return (
    <div className="flex flex-1 min-w-0 items-center gap-1">
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^0-9.]/g, ""))}
        onKeyDown={handleKeyDown}
        placeholder={referencePrice ? referencePrice.toFixed(2) : "Target"}
        className="flex-1 min-w-0 bg-transparent text-xs tabular-nums text-zinc-100 outline-none placeholder:text-zinc-600"
      />
      <div className="flex flex-col gap-px shrink-0">
        <button
          type="button"
          tabIndex={-1}
          onClick={() => stepBy(1)}
          aria-label="Increase target"
          className="rounded-sm p-0.5 text-zinc-500 hover:bg-zinc-700 hover:text-zinc-200 transition-colors"
        >
          <ChevronUp className="h-2.5 w-2.5" strokeWidth={2.5} />
        </button>
        <button
          type="button"
          tabIndex={-1}
          onClick={() => stepBy(-1)}
          aria-label="Decrease target"
          className="rounded-sm p-0.5 text-zinc-500 hover:bg-zinc-700 hover:text-zinc-200 transition-colors"
        >
          <ChevronDown className="h-2.5 w-2.5" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
