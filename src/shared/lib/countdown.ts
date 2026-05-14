import { isCountdownItem } from "@/entities/watchlist/model/helpers";
import type { WatchlistItem } from "@/entities/watchlist/model/types";
import * as chrono from "chrono-node";

const SECOND_MS = 1_000;
const MINUTE_MS = 60 * SECOND_MS;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

export const COUNTDOWN_CLOCK_THRESHOLD_MS = 30 * DAY_MS;

const FRIENDLY_TIMEZONE_REPLACEMENTS: Array<[RegExp, string]> = [
	[/\beastern(?:\s+time)?\b/gi, "ET"],
	[/\bcentral(?:\s+time)?\b/gi, "CT"],
	[/\bmountain(?:\s+time)?\b/gi, "MT"],
	[/\bpacific(?:\s+time)?\b/gi, "PT"],
];

function normalizeCountdownInput(value: string): string {
	return FRIENDLY_TIMEZONE_REPLACEMENTS.reduce(
		(current, [pattern, replacement]) => current.replace(pattern, replacement),
		value.trim(),
	);
}

export function parseCountdownInput(value: string): Date | null {
	const trimmed = normalizeCountdownInput(value);
	return trimmed ? chrono.parseDate(trimmed) : null;
}

export function formatCountdownPreviewDate(date: Date): string {
	return date.toLocaleString("en-US", {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric",
		hour: "numeric",
		minute: "2-digit",
	});
}

export function formatCountdownTarget(date: Date): string {
	return date.toLocaleString("en-US", {
		weekday: "short",
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

export function createCountdownTicker(): string {
	if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
		return `countdown-${crypto.randomUUID()}`;
	}
	return `countdown-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createCountdownItem(
	title: string,
	rawInput: string,
	targetAt: Date,
): WatchlistItem {
	return {
		ticker: createCountdownTicker(),
		title: title.trim() || undefined,
		label: rawInput.trim(),
		type: "Countdown",
		source: "countdown",
		countdown: {
			rawInput: rawInput.trim(),
			targetAt: targetAt.toISOString(),
		},
	};
}

export interface CountdownStatus {
	state: "counting" | "expired";
	mode: "days" | "clock" | "expired";
	primary: string;
	secondary: string;
}

export function getCountdownStatus(targetAt: string | Date, now = Date.now()): CountdownStatus {
	const target = typeof targetAt === "string" ? new Date(targetAt) : targetAt;
	const diff = target.getTime() - now;

	if (diff <= 0) {
		return {
			state: "expired",
			mode: "expired",
			primary: "Expired",
			secondary: "Target reached",
		};
	}

	if (diff < COUNTDOWN_CLOCK_THRESHOLD_MS) {
		const totalSeconds = Math.max(0, Math.floor(diff / SECOND_MS));
		const days = Math.floor(totalSeconds / 86_400);
		const hours = Math.floor((totalSeconds % 86_400) / 3600);
		const minutes = Math.floor((totalSeconds % 3600) / 60);
		const seconds = totalSeconds % 60;
		const pad = (n: number) => n.toString().padStart(2, "0");
		return {
			state: "counting",
			mode: "clock",
			primary: `${pad(days)}:${pad(hours)}:${pad(minutes)}:${pad(seconds)}`,
			secondary: "Remaining",
		};
	}

	const days = Math.ceil(diff / DAY_MS);
	return {
		state: "counting",
		mode: "days",
		primary: `${days}`,
		secondary: days === 1 ? "day remaining" : "days remaining",
	};
}

export function getCountdownDate(item: WatchlistItem): Date | null {
	if (!isCountdownItem(item) || !item.countdown?.targetAt) return null;
	const parsed = new Date(item.countdown.targetAt);
	return Number.isNaN(parsed.getTime()) ? null : parsed;
}
