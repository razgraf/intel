export function toTradingViewSymbol(ticker: string, type?: string): string {
	if (type === "Crypto") {
		return ticker.replace("-", "");
	}
	return ticker;
}
