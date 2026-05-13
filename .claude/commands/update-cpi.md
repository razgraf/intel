Update CPI release dates in `src/shared/lib/cpi.ts`.

1. Fetch https://www.bls.gov/schedule/news_release/cpi.htm
   - If BLS is blocked, fall back to the OMB schedule: https://www.whitehouse.gov/wp-content/uploads/2025/09/pfei_schedule_release_dates_cy2026.pdf
2. Parse the page for monthly Consumer Price Index release dates (Bureau of Labor Statistics)
3. Update the `CPI_DATES` array with all dates in `"YYYY-MM-DD"` format
4. Keep current year + next 2 years; drop anything older
5. Preserve the file structure and comments
