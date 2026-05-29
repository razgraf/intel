/**
 * Manual earnings-date overrides for tickers where Yahoo Finance is missing
 * or wrong. When a ticker has an override with a date in the future, it wins
 * over Yahoo's response.
 *
 * Remove entries once Yahoo catches up.
 */
export interface EarningsOverride {
	date: string; // YYYY-MM-DD, earliest day in window
	endDate?: string; // YYYY-MM-DD, latest day if it's a 2-day window
	hour?: "bmo" | "amc" | "dmh" | "";
}

export const EARNINGS_OVERRIDES: Record<string, EarningsOverride> = {
	// LightPath fiscal year ends June 30. Q4/annual report historically lands
	// in late September (Q4 FY25 was Sept 25, 2025). Earnings called AMC at
	// 5pm ET. Q4 FY26 estimate per public sources (subject to confirmation).
	LPTH: { date: "2026-09-24", hour: "amc" },
};
