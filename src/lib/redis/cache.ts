import { redis } from "./client";

const TTL = {
  weather: 30 * 60, // 30 minutes
  news: 15 * 60, // 15 minutes
  calendar: 5 * 60, // 5 minutes
  health: 60 * 60, // 60 minutes
  history: 24 * 60 * 60, // 24 hours
  games: 24 * 60 * 60, // 24 hours
} as const;

type CacheCategory = keyof typeof TTL;

export async function getCached<T>(
  category: CacheCategory,
  key: string,
): Promise<T | null> {
  const cacheKey = `${category}:${key}`;
  const cached = await redis.get<T>(cacheKey);
  return cached;
}

export async function setCache<T>(
  category: CacheCategory,
  key: string,
  data: T,
): Promise<void> {
  const cacheKey = `${category}:${key}`;
  await redis.set(cacheKey, data, { ex: TTL[category] });
}

export async function invalidateCache(
  category: CacheCategory,
  key: string,
): Promise<void> {
  const cacheKey = `${category}:${key}`;
  await redis.del(cacheKey);
}
