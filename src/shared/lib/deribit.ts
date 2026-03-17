const DERIBIT_BASE = "https://www.deribit.com/api/v2/public/";

interface DeribitResponse<T> {
	jsonrpc: string;
	result: T;
}

export async function deribitFetch<T>(
	method: string,
	params: Record<string, string | number | boolean>,
): Promise<T> {
	const url = new URL(method, DERIBIT_BASE);
	for (const [key, value] of Object.entries(params)) {
		url.searchParams.set(key, String(value));
	}
	const res = await fetch(url.toString());
	if (!res.ok) {
		throw new Error(`Deribit API error: ${res.status}`);
	}
	const json: DeribitResponse<T> = await res.json();
	return json.result;
}

export interface RawInstrument {
	instrument_name: string;
	base_currency: string;
	quote_currency: string;
	settlement_currency: string;
	option_type: "call" | "put";
	strike: number;
	expiration_timestamp: number;
}

const instrumentsCache = { data: null as RawInstrument[] | null, ts: 0 };
const INSTRUMENTS_TTL = 5 * 60 * 1000; // 5 minutes

/** Underlyings to show in the preview when the user starts typing "deribit" */
export const DERIBIT_PREVIEW_UNDERLYINGS = ["BTC", "ETH", "SOL", "AVAX"] as const;

export async function getInstruments(): Promise<RawInstrument[]> {
	if (instrumentsCache.data && Date.now() - instrumentsCache.ts < INSTRUMENTS_TTL) {
		return instrumentsCache.data;
	}

	// All USDC-settled options are under the USDC currency
	const instruments = await deribitFetch<RawInstrument[]>("get_instruments", {
		currency: "USDC",
		kind: "option",
		expired: false,
	});

	instrumentsCache.data = instruments;
	instrumentsCache.ts = Date.now();
	return instruments;
}
