import { EXCHANGES, getExchangeStatus } from "@/shared/lib/exchanges";
import { NextResponse } from "next/server";

export async function GET() {
	const now = new Date();
	const statuses = EXCHANGES.map((exchange) => {
		const status = getExchangeStatus(exchange, now);
		return {
			id: exchange.id,
			name: exchange.name,
			isOpen: status.isOpen,
			minutesUntilChange: status.minutesUntilChange,
		};
	});
	return NextResponse.json(statuses);
}
