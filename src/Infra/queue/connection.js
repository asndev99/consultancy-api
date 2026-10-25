// BullMQ creates its own ioredis connections from these options. Workers need
// maxRetriesPerRequest: null, which the shared redis client doesn't set.
export const queueConnection = {
  host: process.env.REDIS_HOST ?? "localhost",
  port: Number(process.env.REDIS_PORT ?? 6379),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null,
};
