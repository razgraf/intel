/**
 * FOMC (Federal Open Market Committee) meeting announcement dates.
 * Each date is the last day of the meeting (announcement day).
 * Source: https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm
 *
 * Use the /update-fomc command to refresh this every once in a while
 */
export const FOMC_DATES: string[] = [
	// 2025
	"2025-01-29",
	"2025-03-19",
	"2025-05-07",
	"2025-06-18",
	"2025-07-30",
	"2025-09-17",
	"2025-10-29",
	"2025-12-10",
	// 2026
	"2026-01-28",
	"2026-03-18",
	"2026-04-29",
	"2026-06-17",
	"2026-07-29",
	"2026-09-16",
	"2026-10-28",
	"2026-12-09",
];

export function getUpcomingFOMC(now: Date): Array<{ date: string }> {
	const today = now.toISOString().slice(0, 10);
	return FOMC_DATES.filter((d) => d >= today).map((date) => ({ date }));
}
