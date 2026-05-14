import type { AssetType } from "@/shared/lib/constants";

export interface EmbedConfig {
	kind: "youtube";
	url: string;
}

export interface CountdownConfig {
	rawInput: string;
	targetAt: string;
}

export interface TargetRow {
	ticker: string;
	price: number;
}

export interface TargetsConfig {
	rows: TargetRow[];
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
	source?: "yahoo" | "deribit" | "youtube" | "countdown" | "targets";
}
