import { deribitFetch } from "@/shared/lib/deribit";
import { NextResponse } from "next/server";

type DeribitRange = "1D" | "1W" | "1M";

const RANGE_MS: Record<DeribitRange, number> = {
	"1D": 24 * 60 * 60 * 1000,
	"1W": 7 * 24 * 60 * 60 * 1000,
	"1M": 30 * 24 * 60 * 60 * 1000,
};

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const symbol = searchParams.get("symbol");
	const range = (searchParams.get("range") ?? "1D") as DeribitRange;

	if (!symbol) {
		return NextResponse.json({ error: "Missing symbol parameter" }, { status: 400 });
	}

	if (!RANGE_MS[range]) {
		return NextResponse.json({ error: "Invalid range. Use 1D, 1W, or 1M" }, { status: 400 });
	}

	const RESOLUTION: Record<DeribitRange, string> = {
		"1D": "5",
		"1W": "60",
		"1M": "1D",
	};

	try {
		const now = Date.now();
		const start = now - RANGE_MS[range];

		const result = await deribitFetch<{
			ticks: number[];
			close: number[];
		}>("get_tradingview_chart_data", {
			instrument_name: symbol,
			start_timestamp: start,
			end_timestamp: now,
			resolution: RESOLUTION[range],
		});

		const points = result.ticks.map((tick, i) => ({
			time: tick,
			value: result.close[i],
		}));

		return NextResponse.json(points);
	} catch (error) {
		console.error("Deribit history error:", error);
		return NextResponse.json([], { status: 500 });
	}
}
