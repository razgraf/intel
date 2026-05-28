import { Redis } from "@upstash/redis";

export const redis = Redis.fromEnv();

export function watchlistKey(userId: string) {
	return `watchlist:${userId}`;
}
