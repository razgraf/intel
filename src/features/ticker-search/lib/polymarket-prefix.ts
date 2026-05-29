const PREFIXES = ["polymarket ", "poly "] as const;

export interface PolymarketPrefixMatch {
	active: boolean;
	query: string;
}

/**
 * Polymarket is committed only with a trailing space ("polymarket " or "poly ")
 * to avoid blocking Yahoo search for tickers starting with P (e.g. POLY itself
 * is Polymet Mining).
 */
export function matchPolymarketPrefix(lowerQuery: string): PolymarketPrefixMatch {
	for (const prefix of PREFIXES) {
		if (lowerQuery.startsWith(prefix)) {
			return { active: true, query: lowerQuery.slice(prefix.length).trim() };
		}
	}
	return { active: false, query: "" };
}
