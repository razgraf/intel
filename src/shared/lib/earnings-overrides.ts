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
	// Example — uncomment + fill in once a real next date is known:
	// LPTH: { date: "2026-08-04", hour: "amc" },
};
