import { Queue } from "bullmq";
import { queueConnection } from "./connection.js";
import logger from "../../lib/application.logger.js";

export const NOTIFICATION_QUEUE_NAME = "notifications";

// Job names on the notifications queue. Jobs queued before these existed were
// named after their eventType, so the worker treats any unknown name as Create.
export const NotificationJob = {
  Create: "notification.create",
  MarkRead: "notification.markRead",
};

export const notificationQueue = new Queue(NOTIFICATION_QUEUE_NAME, {
  connection: queueConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: 1000,
    removeOnFail: 5000,
  },
});

notificationQueue.on("error", (error) => {
  logger.error(`Notification queue error: ${error.message || error.code}`);
});

// queue.add() waits indefinitely while Redis is unreachable, so it's capped
// to keep the API request from hanging.
const ENQUEUE_TIMEOUT_MS = 3000;

// Throws when the job can't be queued; use when the caller must know.
export const addNotificationJob = async (name, payload) => {
  let timer;
  try {
    return await Promise.race([
      notificationQueue.add(name, payload),
      new Promise((_, reject) => {
        timer = setTimeout(
          () => reject(new Error("timed out waiting for Redis")),
          ENQUEUE_TIMEOUT_MS,
        );
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
};

/**
 * payload: {
 *   eventType, screen, title, message, metadata,
 *   businessId, branchId, actorId, isFromSystem, recipientIds
 * }
 *
 * Never throws: a notification failing to enqueue must not fail the action
 * that triggered it, since that action has already been committed.
 */
export const enqueueNotification = async (payload) => {
  try {
    await addNotificationJob(NotificationJob.Create, payload);
  } catch (error) {
    logger.error(
      `Failed to enqueue notification "${payload.eventType}": ${error.message}`,
    );
  }
};
