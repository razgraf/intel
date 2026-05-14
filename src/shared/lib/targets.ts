import type { WatchlistItem } from "@/entities/watchlist/model/types";

export const MAX_TARGET_ROWS = 4;
export const TARGET_PROXIMITY_THRESHOLD = 0.02;

export function createTargetsTicker(): string {
	if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
		return `targets-${crypto.randomUUID()}`;
	}
	return `targets-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createTargetsItem(): WatchlistItem {
	return {
		ticker: createTargetsTicker(),
		label: "Targets",
		type: "Targets",
		source: "targets",
		targets: { rows: [] },
	};
}

export function targetDeviation(current: number, target: number): number | null {
	if (!Number.isFinite(current) || !Number.isFinite(target) || target <= 0) return null;
	return (current - target) / target;
}

export function isWithinThreshold(current: number, target: number): boolean {
	const dev = targetDeviation(current, target);
	return dev !== null && Math.abs(dev) <= TARGET_PROXIMITY_THRESHOLD;
}

export function adaptiveStep(price: number): number {
	if (!Number.isFinite(price) || price <= 0) return 0.05;
	if (price >= 10_000) return 10;
	if (price >= 10) return 1;
	return 0.05;
}

export function roundToStep(value: number, step: number): number {
	const decimals = step < 1 ? Math.ceil(-Math.log10(step)) : 0;
	const factor = 10 ** decimals;
	return Math.round(value * factor) / factor;
}
