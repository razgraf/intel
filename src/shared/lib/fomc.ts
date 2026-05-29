/**
 * FOMC (Federal Open Market Committee) meeting announcement dates.
 * Each date is the last day of the meeting (announcement day).
 * Source: https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm
 *
 * Use the /update-fomc command to refresh this every once in a while
 */
export const FOMC_DATES: string[] = [
	// 2026
	"2026-01-28",
	"2026-03-18",
	"2026-04-29",
	"2026-06-17",
	"2026-07-29",
	"2026-09-16",
	"2026-10-28",
	"2026-12-09",
	// 2027
	"2027-01-27",
	"2027-03-17",
	"2027-04-28",
	"2027-06-09",
	"2027-07-28",
	"2027-09-15",
	"2027-10-27",
	"2027-12-08",
	// 2028
	"2028-01-26",
];

export function getUpcomingFOMC(now: Date): Array<{ date: string }> {
	const today = now.toISOString().slice(0, 10);
	return FOMC_DATES.filter((d) => d >= today).map((date) => ({ date }));
}
