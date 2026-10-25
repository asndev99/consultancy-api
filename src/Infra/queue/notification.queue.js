import { Queue } from "bullmq";
import { queueConnection } from "./connection.js";
import logger from "../../lib/application.logger.js";

export const NOTIFICATION_QUEUE_NAME = "notifications";

export const notificationQueue = new Queue(NOTIFICATION_QUEUE_NAME, {
  connection: queueConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: 1000,
    removeOnFail: 5000,
  },
});

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
    await notificationQueue.add(payload.eventType, payload);
  } catch (error) {
    logger.error(
      `Failed to enqueue notification "${payload.eventType}": ${error.message}`,
    );
  }
};
