import yahooFinance, { withTimeout } from "@/shared/lib/yahoo";
import { NextResponse } from "next/server";

interface OptionsCallOrPut {
	strike: number;
	lastPrice: number;
	bid?: number;
	ask?: number;
	volume?: number;
	openInterest?: number;
	impliedVolatility: number;
}

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const symbol = searchParams.get("symbol");

	if (!symbol) {
		return NextResponse.json({ error: "Missing symbol parameter" }, { status: 400 });
	}

	try {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const result: any = await withTimeout(yahooFinance.options(symbol, {}));

		const MAX_CONTRACTS = 50;
		const allCalls: OptionsCallOrPut[] = result.options?.[0]?.calls ?? [];
		const allPuts: OptionsCallOrPut[] = result.options?.[0]?.puts ?? [];

		// Keep the 50 contracts nearest to current price (by strike midpoint)
		const capNearMoney = (contracts: OptionsCallOrPut[]) => {
			if (contracts.length <= MAX_CONTRACTS) return contracts;
			const sorted = [...contracts].sort((a, b) => a.strike - b.strike);
			const mid = Math.floor(sorted.length / 2);
			const half = Math.floor(MAX_CONTRACTS / 2);
			return sorted.slice(Math.max(0, mid - half), mid - half + MAX_CONTRACTS);
		};

		const calls = capNearMoney(allCalls);
		const puts = capNearMoney(allPuts);

		const mapContract = (c: OptionsCallOrPut) => ({
			strike: c.strike ?? 0,
			expiration: "",
			lastPrice: c.lastPrice ?? 0,
			bid: c.bid ?? 0,
			ask: c.ask ?? 0,
			volume: c.volume ?? 0,
			openInterest: c.openInterest ?? 0,
			impliedVolatility: c.impliedVolatility ?? 0,
		});

		return NextResponse.json({
			expirationDates: (result.expirationDates ?? []).map((d: Date) => new Date(d).getTime()),
			strikes: result.strikes ?? [],
			calls: calls.map(mapContract),
			puts: puts.map(mapContract),
		});
	} catch (error) {
		console.error("Options error:", error);
		return NextResponse.json(
			{ expirationDates: [], strikes: [], calls: [], puts: [] },
			{ status: 500 },
		);
	}
}
