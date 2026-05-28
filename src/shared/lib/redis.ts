import { Redis } from "@upstash/redis";

let cached: Redis | null = null;

export function getRedis(): Redis | null {
	if (cached) return cached;
	if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
		return null;
	}
	cached = Redis.fromEnv();
	return cached;
}

export function watchlistKey(userId: string) {
	return `watchlist:${userId}`;
}
