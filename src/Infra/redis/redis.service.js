import { redis } from "./redis.client.js";
import logger from "../../lib/application.logger.js";

// Redis is only a cache here: every helper gives up after a short timeout and
// reports a miss/no-op, so callers fall back to the database instead of
// hanging while Redis is unreachable.
const REDIS_TIMEOUT_MS = 300;

const withTimeout = async (operation, fallback) => {
  let timer;
  try {
    return await Promise.race([
      operation(),
      new Promise((_, reject) => {
        timer = setTimeout(
          () => reject(new Error("timed out waiting for Redis")),
          REDIS_TIMEOUT_MS,
        );
      }),
    ]);
  } catch (error) {
    logger.warn(`Redis cache unavailable: ${error.message || error.code}`);
    return fallback;
  } finally {
    clearTimeout(timer);
  }
};

export const cacheGetJson = async (key) => {
  const value = await withTimeout(() => redis.get(key), null);
  return value == null ? null : JSON.parse(value);
};

export const cacheSetJson = (key, value, ttlSeconds) =>
  withTimeout(
    () => redis.set(key, JSON.stringify(value), "EX", ttlSeconds),
    null,
  );

export const cacheDelete = (...keys) =>
  keys.length === 0 ? null : withTimeout(() => redis.del(...keys), null);
