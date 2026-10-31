import Redis from "ioredis";
import logger from "../../lib/application.logger.js";

export const redis = new Redis({
  host: process.env.REDIS_HOST ?? "localhost",
  port: Number(process.env.REDIS_PORT ?? 6379),
  password: process.env.REDIS_PASSWORD,
});

redis.on("error", (error) => {
  logger.error(`Redis client error: ${error.message || error.code}`);
});
