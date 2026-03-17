import yf, { batchSettled, withTimeout } from "@/shared/lib/yahoo";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const symbols = searchParams.get("symbols");

	if (!symbols) {
		return NextResponse.json({ error: "Missing symbols parameter" }, { status: 400 });
	}

	const tickers = symbols.split(",").filter(Boolean);

	const results = await batchSettled(
		tickers.map((symbol) => async () => {
			const data = await withTimeout(
				yf.quoteSummary(symbol, {
					modules: ["calendarEvents"],
				}),
			);
			const earnings = data.calendarEvents?.earnings;
			if (!earnings?.earningsDate?.length) return null;

			const date = earnings.earningsDate[0];
			const dateStr =
				date instanceof Date
					? date.toISOString().split("T")[0]
					: new Date(date).toISOString().split("T")[0];

			const today = new Date().toISOString().split("T")[0];
			if (dateStr < today) return null;

			return {
				symbol,
				date: dateStr,
				epsEstimate: earnings.earningsAverage ?? null,
				hour: "",
			};
		}),
		5,
	);

	const earnings = results.map((r) => (r.status === "fulfilled" ? r.value : null)).filter(Boolean);

	return NextResponse.json(earnings);
}
