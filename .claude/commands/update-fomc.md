Update FOMC meeting dates in `src/shared/lib/fomc.ts`.

1. Fetch https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm
2. Parse the page for FOMC meeting announcement dates (use the *last day* of each 2-day meeting)
3. Update the `FOMC_DATES` array with all future dates, keeping the `"YYYY-MM-DD"` format
4. Remove past years, keep current + next 2 years
5. Preserve the file structure and comments
