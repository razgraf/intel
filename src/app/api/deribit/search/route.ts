import { DERIBIT_PREVIEW_UNDERLYINGS, getInstruments } from "@/shared/lib/deribit";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const query = searchParams.get("q")?.toUpperCase() ?? "";
	const preview = searchParams.get("preview") === "1";

	try {
		const instruments = await getInstruments();

		if (preview) {
			// Return first instrument per preview underlying
			const results = DERIBIT_PREVIEW_UNDERLYINGS.map((base) =>
				instruments.find((i) => i.base_currency === base),
			)
				.filter((i) => i != null)
				.map((i) => ({
					symbol: i.instrument_name,
					shortname: i.instrument_name,
					exchange: "Deribit",
					quoteType: "OPTION",
				}));

			return NextResponse.json(results);
		}

		if (!query) {
			return NextResponse.json([]);
		}

		const matches = instruments
			.filter((i) => i.instrument_name.toUpperCase().includes(query))
			.slice(0, 20)
			.map((i) => ({
				symbol: i.instrument_name,
				shortname: i.instrument_name,
				exchange: "Deribit",
				quoteType: "OPTION",
			}));

		return NextResponse.json(matches);
	} catch (error) {
		console.error("Deribit search error:", error);
		return NextResponse.json([], { status: 500 });
	}
}
