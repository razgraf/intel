export interface Exchange {
	id: string;
	name: string;
	timezone: string;
	/** [openHour, openMinute, closeHour, closeMinute] */
	hours: [number, number, number, number];
	/** Days open (0=Sun, 1=Mon, ..., 6=Sat) */
	days: number[];
	alwaysOn?: boolean;
}

export const EXCHANGES: Exchange[] = [
	{
		id: "nyse",
		name: "NYSE",
		timezone: "America/New_York",
		hours: [9, 30, 16, 0],
		days: [1, 2, 3, 4, 5],
	},
	{
		id: "cme",
		name: "CME",
		timezone: "America/Chicago",
		hours: [17, 0, 16, 0],
		days: [0, 1, 2, 3, 4],
	},
	{
		id: "lse",
		name: "LSE",
		timezone: "Europe/London",
		hours: [8, 0, 16, 30],
		days: [1, 2, 3, 4, 5],
	},
	{
		id: "bvb",
		name: "BVB",
		timezone: "Europe/Bucharest",
		hours: [10, 0, 17, 45],
		days: [1, 2, 3, 4, 5],
	},
	{
		id: "nikkei",
		name: "Nikkei",
		timezone: "Asia/Tokyo",
		hours: [9, 0, 15, 0],
		days: [1, 2, 3, 4, 5],
	},
	{
		id: "crypto",
		name: "Crypto",
		timezone: "UTC",
		hours: [0, 0, 23, 59],
		days: [0, 1, 2, 3, 4, 5, 6],
		alwaysOn: true,
	},
	{
		id: "deribit",
		name: "Deribit",
		timezone: "UTC",
		hours: [0, 0, 23, 59],
		days: [0, 1, 2, 3, 4, 5, 6],
		alwaysOn: true,
	},
];

export interface ExchangeStatus {
	exchange: Exchange;
	isOpen: boolean;
	/** Minutes until next state change */
	minutesUntilChange: number;
}

function getMinutesSinceMidnight(date: Date, timezone: string): number {
	const parts = new Intl.DateTimeFormat("en-US", {
		hour: "numeric",
		minute: "numeric",
		hour12: false,
		timeZone: timezone,
	}).formatToParts(date);

	const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
	const minute = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
	return hour * 60 + minute;
}

function getDayOfWeek(date: Date, timezone: string): number {
	const dayStr = new Intl.DateTimeFormat("en-US", {
		weekday: "short",
		timeZone: timezone,
	}).format(date);
	const map: Record<string, number> = {
		Sun: 0,
		Mon: 1,
		Tue: 2,
		Wed: 3,
		Thu: 4,
		Fri: 5,
		Sat: 6,
	};
	return map[dayStr] ?? 0;
}

export function getExchangeStatus(exchange: Exchange, now = new Date()): ExchangeStatus {
	if (exchange.id === "crypto" || exchange.id === "deribit") {
		return {
			exchange,
			isOpen: true,
			minutesUntilChange: Number.POSITIVE_INFINITY,
		};
	}

	const [openH, openM, closeH, closeM] = exchange.hours;
	const openMinutes = openH * 60 + openM;
	const closeMinutes = closeH * 60 + closeM;
	const currentMinutes = getMinutesSinceMidnight(now, exchange.timezone);
	const dayOfWeek = getDayOfWeek(now, exchange.timezone);

	const isTradingDay = exchange.days.includes(dayOfWeek);

	// CME has overnight session (open > close means crosses midnight)
	const crossesMidnight = openMinutes > closeMinutes;

	let isOpen = false;
	let minutesUntilChange = 0;

	if (!isTradingDay) {
		// Find next trading day
		const nextDay = exchange.days.find((d) => d > dayOfWeek) ?? (exchange.days[0] || 0);
		const daysUntil = nextDay > dayOfWeek ? nextDay - dayOfWeek : 7 - dayOfWeek + nextDay;
		minutesUntilChange = daysUntil * 24 * 60 - currentMinutes + openMinutes;
	} else if (crossesMidnight) {
		// Overnight session: open at 17:00, close at 16:00 next day
		isOpen = currentMinutes >= openMinutes || currentMinutes < closeMinutes;
		minutesUntilChange = isOpen
			? currentMinutes >= openMinutes
				? 24 * 60 - currentMinutes + closeMinutes
				: closeMinutes - currentMinutes
			: openMinutes - currentMinutes;
	} else {
		isOpen = currentMinutes >= openMinutes && currentMinutes < closeMinutes;
		minutesUntilChange = isOpen
			? closeMinutes - currentMinutes
			: currentMinutes < openMinutes
				? openMinutes - currentMinutes
				: 24 * 60 - currentMinutes + openMinutes;
	}

	return { exchange, isOpen, minutesUntilChange };
}

export function formatCountdown(minutes: number): string {
	if (!Number.isFinite(minutes)) return "24/7";
	const h = Math.floor(minutes / 60);
	const m = minutes % 60;
	if (h === 0) return `${m}m`;
	return `${h}h ${m}m`;
}
