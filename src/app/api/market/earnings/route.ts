import { EARNINGS_OVERRIDES } from "@/shared/lib/earnings-overrides";
import yf, { batchSettled, withTimeout } from "@/shared/lib/yahoo";
import { NextResponse } from "next/server";

type EarningsResult = {
	symbol: string;
	date: string;
	endDate?: string;
	epsEstimate: number | null;
	hour: "bmo" | "amc" | "dmh" | "";
};

function toDateStr(d: Date | number): string {
	return (d instanceof Date ? d : new Date(d)).toISOString().split("T")[0];
}

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const symbols = searchParams.get("symbols");

	if (!symbols) {
		return NextResponse.json({ error: "Missing symbols parameter" }, { status: 400 });
	}

	const tickers = symbols.split(",").filter(Boolean);
	const today = new Date().toISOString().split("T")[0];

	const results = await batchSettled(
		tickers.map((symbol) => async (): Promise<EarningsResult | null> => {
			const data = await withTimeout(
				yf.quoteSummary(symbol, {
					modules: ["calendarEvents"],
				}),
			);
			const earnings = data.calendarEvents?.earnings;
			if (!earnings?.earningsDate?.length) return null;

			const dates = earnings.earningsDate.map(toDateStr);
			const date = dates[0];
			const endDate =
				dates.length > 1 && dates[dates.length - 1] !== date ? dates[dates.length - 1] : undefined;

			// A window already in progress (start < today <= end) still counts as upcoming.
			const lastDay = endDate ?? date;
			if (lastDay < today) return null;

			return {
				symbol,
				date,
				...(endDate ? { endDate } : {}),
				epsEstimate: earnings.earningsAverage ?? null,
				hour: "",
			};
		}),
		5,
	);

	const yahooByTicker = new Map<string, EarningsResult>();
	results.forEach((r, i) => {
		if (r.status === "fulfilled" && r.value) {
			yahooByTicker.set(tickers[i], r.value);
		}
	});

	const earnings: EarningsResult[] = [];
	for (const symbol of tickers) {
		const override = EARNINGS_OVERRIDES[symbol];
		const overrideLastDay = override ? (override.endDate ?? override.date) : null;
		if (override && overrideLastDay && overrideLastDay >= today) {
			earnings.push({
				symbol,
				date: override.date,
				...(override.endDate ? { endDate: override.endDate } : {}),
				epsEstimate: null,
				hour: override.hour ?? "",
			});
			continue;
		}
		const yahoo = yahooByTicker.get(symbol);
		if (yahoo) earnings.push(yahoo);
	}

	return NextResponse.json(earnings);
}
