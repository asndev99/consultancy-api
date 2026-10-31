import {
  addNotificationJob,
  NotificationJob,
} from "../../Infra/queue/notification.queue.js";
import logger from "../../lib/application.logger.js";
import { ServiceUnavailableException } from "../../shared/error.js";

// Queues the update and returns straight away; the notification worker sets
// readAt. Only the caller's own recipient rows are touched, so IDs of
// notifications they didn't receive (or already read) are simply skipped.
export const MarkNotificationsReadUseCase = async (req, payload) => {
  const notificationIds = [...new Set(payload.notificationIds.map(Number))];

  try {
    await addNotificationJob(NotificationJob.MarkRead, {
      userId: req.user.id,
      notificationIds,
      readAt: new Date().toISOString(),
    });
  } catch (error) {
    logger.error(`Failed to enqueue mark-read: ${error.message}`);
    throw new ServiceUnavailableException(
      "Couldn't mark notifications as read right now, please try again",
    );
  }

  return { notificationIds };
};
