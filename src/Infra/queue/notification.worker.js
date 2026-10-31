import { Worker } from "bullmq";
import { queueConnection } from "./connection.js";
import {
  NOTIFICATION_QUEUE_NAME,
  NotificationJob,
} from "./notification.queue.js";
import NotificationRepository from "../db/repositories/notification/index.js";
import logger from "../../lib/application.logger.js";

async function createNotification(data) {
  const {
    eventType,
    screen,
    title,
    message,
    metadata = {},
    businessId,
    branchId,
    actorId = null,
    isFromSystem = actorId == null,
    recipientIds = [],
  } = data;

  const uniqueRecipientIds = [...new Set(recipientIds.map(Number))];

  const notification =
    await NotificationRepository.CreateNotificationWithRecipients(
      {
        eventType,
        screen,
        title,
        message,
        metadata,
        businessId,
        branchId,
        actorId,
        isFromSystem,
      },
      uniqueRecipientIds,
    );

  return { notificationId: notification.id };
}

// readAt is the time of the request, not of processing, so a delayed or
// retried job still records when the user actually read the notifications.
async function markNotificationsRead({ userId, notificationIds, readAt }) {
  const { count } = await NotificationRepository.MarkNotificationsRead(
    userId,
    notificationIds,
    new Date(readAt),
  );
  return { markedRead: count };
}

export const notificationWorker = new Worker(
  NOTIFICATION_QUEUE_NAME,
  async (job) =>
    job.name === NotificationJob.MarkRead
      ? markNotificationsRead(job.data)
      : createNotification(job.data),
  { connection: queueConnection },
);

notificationWorker.on("error", (error) => {
  logger.error(`Notification worker error: ${error.message || error.code}`);
});

notificationWorker.on("failed", (job, error) => {
  logger.error(
    `Notification job ${job?.id} (${job?.name}) failed: ${error.message}`,
  );
});
