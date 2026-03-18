export const AssetType = {
	Stock: "Stock",
	ETF: "ETF",
	Crypto: "Crypto",
	Bond: "Bond",
	Future: "Future",
	Option: "Option",
	Index: "Index",
} as const;

export type AssetType = (typeof AssetType)[keyof typeof AssetType];

export const TIMEFRAMES = ["1D", "1W", "1M", "3M", "1Y", "ALL"] as const;
export type Timeframe = (typeof TIMEFRAMES)[number];

export const TIMEFRAME_INTERVALS: Record<
	Timeframe,
	{ range: string; interval: string; windowSecs: number }
> = {
	"1D": { range: "1d", interval: "5m", windowSecs: 86_400 },
	"1W": { range: "5d", interval: "15m", windowSecs: 5 * 86_400 },
	"1M": { range: "1mo", interval: "1h", windowSecs: 30 * 86_400 },
	"3M": { range: "3mo", interval: "1d", windowSecs: 90 * 86_400 },
	"1Y": { range: "1y", interval: "1d", windowSecs: 365 * 86_400 },
	ALL: { range: "max", interval: "1wk", windowSecs: 25 * 365 * 86_400 },
};

export const COLORS = {
	bg: "#0a0a0f",
	card: "#111118",
	border: "#1e1e2e",
	green: "#22c55e",
	red: "#ef4444",
	muted: "#71717a",
	text: "#fafafa",
	textSecondary: "#a1a1aa",
} as const;

export const ASSET_TYPE_COLORS: Record<AssetType | "Embed" | "Countdown", string> = {
	Stock: "#3b82f6",
	ETF: "#a78bfa",
	Crypto: "#f59e0b",
	Bond: "#6ee7b7",
	Future: "#f472b6",
	Option: "#fb923c",
	Index: "#38bdf8",
	Embed: "#e11d48",
	Countdown: "#facc15",
};

export const POLL_INTERVAL = 60_000; // 1 minute to avoid rate limits
