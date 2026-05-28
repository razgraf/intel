export function isAccountsEnabled(): boolean {
	return Boolean(
		process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
			process.env.CLERK_SECRET_KEY &&
			process.env.UPSTASH_REDIS_REST_URL &&
			process.env.UPSTASH_REDIS_REST_TOKEN,
	);
}
