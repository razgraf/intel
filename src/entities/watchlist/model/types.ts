import type { AssetType } from "@/shared/lib/constants";

export interface EmbedConfig {
	kind: "youtube";
	url: string;
}

export interface CountdownConfig {
	rawInput: string;
	targetAt: string;
}

export type TargetDirection = "long" | "short";

export interface TargetRow {
	ticker: string;
	price: number;
	direction?: TargetDirection;
}

export interface TargetsConfig {
	rows: TargetRow[];
}

export interface PolymarketConfig {
	eventId: string;
	slug: string;
	title?: string;
	image?: string;
}

export interface WatchlistItem {
	ticker: string;
	title?: string;
	label?: string;
	type?: AssetType | "Embed" | "Countdown" | "Targets";
	currency?: string;
	futuresTicker?: string;
	isin?: string;
	notes?: string;
	embed?: EmbedConfig;
	countdown?: CountdownConfig;
	targets?: TargetsConfig;
	polymarket?: PolymarketConfig;
	source?: "yahoo" | "deribit" | "youtube" | "countdown" | "targets" | "polymarket";
}
