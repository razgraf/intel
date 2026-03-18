import type { AssetType } from "@/shared/lib/constants";

export interface EmbedConfig {
	kind: "youtube";
	url: string;
}

export interface CountdownConfig {
	rawInput: string;
	targetAt: string;
}

export interface WatchlistItem {
	ticker: string;
	title?: string;
	label?: string;
	type?: AssetType | "Embed" | "Countdown";
	currency?: string;
	futuresTicker?: string;
	notes?: string;
	embed?: EmbedConfig;
	countdown?: CountdownConfig;
	source?: "yahoo" | "deribit" | "youtube" | "countdown";
}
