import YahooFinance from "yahoo-finance2";

const yf = new YahooFinance();

const REQUEST_TIMEOUT = 10_000;

/** Race a promise against a timeout. */
export function withTimeout<T>(promise: Promise<T>, ms = REQUEST_TIMEOUT): Promise<T> {
	return Promise.race([
		promise,
		new Promise<never>((_, reject) =>
			setTimeout(() => reject(new Error(`Yahoo request timed out after ${ms}ms`)), ms),
		),
	]);
}

/** Run a batch of async functions with a concurrency limit. */
export async function batchSettled<T>(
	tasks: (() => Promise<T>)[],
	concurrency = 5,
): Promise<PromiseSettledResult<T>[]> {
	const results: PromiseSettledResult<T>[] = new Array(tasks.length);
	let idx = 0;

	async function worker() {
		while (idx < tasks.length) {
			const i = idx++;
			try {
				results[i] = { status: "fulfilled", value: await tasks[i]() };
			} catch (reason) {
				results[i] = { status: "rejected", reason };
			}
		}
	}

	await Promise.all(Array.from({ length: Math.min(concurrency, tasks.length) }, () => worker()));
	return results;
}

export default yf;
