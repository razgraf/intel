export async function apiFetch<T>(path: string, params?: Record<string, string>): Promise<T> {
	const url = new URL(path, window.location.origin);
	if (params) {
		for (const [key, value] of Object.entries(params)) {
			url.searchParams.set(key, value);
		}
	}
	const res = await fetch(url);
	if (!res.ok) {
		throw new Error(`API error: ${res.status} ${res.statusText}`);
	}
	return res.json();
}
