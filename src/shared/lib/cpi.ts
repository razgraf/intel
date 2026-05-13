/**
 * BLS CPI (Consumer Price Index) release dates.
 * Each report is released 8:30 ET on the scheduled day, covering the prior month.
 * Source: https://www.bls.gov/schedule/news_release/cpi.htm
 *
 * Use the /update-cpi command to refresh this every once in a while.
 */
export const CPI_DATES: string[] = [
	// 2025 (Oct release canceled, Nov rescheduled to 12-18 due to the 2025 shutdown)
	"2025-01-15",
	"2025-02-12",
	"2025-03-12",
	"2025-04-10",
	"2025-05-13",
	"2025-06-11",
	"2025-07-15",
	"2025-08-12",
	"2025-09-11",
	"2025-10-24",
	"2025-12-18",
	// 2026 (from OMB Principal Federal Economic Indicators schedule)
	"2026-01-13",
	"2026-02-11",
	"2026-03-11",
	"2026-04-10",
	"2026-05-12",
	"2026-06-10",
	"2026-07-14",
	"2026-08-12",
	"2026-09-11",
	"2026-10-14",
	"2026-11-10",
	"2026-12-10",
];

export function getUpcomingCPI(now: Date): Array<{ date: string }> {
	const today = now.toISOString().slice(0, 10);
	return CPI_DATES.filter((d) => d >= today).map((date) => ({ date }));
}
