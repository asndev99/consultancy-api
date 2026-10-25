import { Worker } from "bullmq";
import { queueConnection } from "./connection.js";
import { NOTIFICATION_QUEUE_NAME } from "./notification.queue.js";
import NotificationRepository from "../db/repositories/notification/index.js";
import logger from "../../lib/application.logger.js";

export const notificationWorker = new Worker(
  NOTIFICATION_QUEUE_NAME,
  async (job) => {
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
    } = job.data;

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
  },
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
