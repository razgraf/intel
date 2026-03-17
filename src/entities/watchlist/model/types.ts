import type { AssetType } from "@/shared/lib/constants";

export interface EmbedConfig {
	kind: "youtube";
	url: string;
}

export interface WatchlistItem {
	ticker: string;
	label?: string;
	type?: AssetType | "Embed";
	currency?: string;
	futuresTicker?: string;
	notes?: string;
	embed?: EmbedConfig;
	source?: "yahoo" | "deribit";
}
