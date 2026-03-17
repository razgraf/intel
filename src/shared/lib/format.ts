const compactFormatter = new Intl.NumberFormat("en-US", {
	notation: "compact",
	maximumFractionDigits: 2,
});

export function formatPrice(value: number, currency = "USD"): string {
	if (Math.abs(value) >= 1000) {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency,
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(value);
	}
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency,
		minimumFractionDigits: 2,
		maximumFractionDigits: value < 1 ? 6 : 2,
	}).format(value);
}

export function formatPercent(value: number): string {
	const sign = value >= 0 ? "+" : "";
	return `${sign}${value.toFixed(2)}%`;
}

export function formatCompact(value: number): string {
	return compactFormatter.format(value);
}

export function formatTime(date: Date): string {
	return date.toLocaleTimeString("en-US", {
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	});
}

export function formatUTCTime(date: Date): string {
	return date.toLocaleTimeString("en-US", {
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hour12: false,
		timeZone: "UTC",
	});
}

export function formatLocalTime(date: Date): string {
	return date.toLocaleTimeString("en-US", {
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hour12: false,
	});
}

export function getLocalTimezone(): string {
	return (
		new Intl.DateTimeFormat("en-US", { timeZoneName: "short" })
			.formatToParts(new Date())
			.find((p) => p.type === "timeZoneName")?.value ?? "Local"
	);
}
