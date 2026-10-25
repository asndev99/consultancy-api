import NotificationRepository from "../../Infra/db/repositories/notification/index.js";
import { BadRequestException } from "../../shared/error.js";

export const GetMyNotificationsUseCase = async (
  req,
  { page = 1, pageSize = 10, isRead },
) => {
  if (!Number.isInteger(page) || page < 1) {
    throw new BadRequestException("page must be a positive integer");
  }
  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) {
    throw new BadRequestException("pageSize must be between 1 and 100");
  }

  const userId = req.user.id;
  const skip = (page - 1) * pageSize;

  const [total, unreadCount, rows] = await Promise.all([
    NotificationRepository.CountNotificationsByUser(userId, { isRead }),
    NotificationRepository.CountNotificationsByUser(userId, { isRead: false }),
    NotificationRepository.FindNotificationsByUser(userId, {
      isRead,
      skip,
      take: pageSize,
    }),
  ]);

  const notifications = rows.map(({ readAt, Notification }) => ({
    ...Notification,
    readAt,
    isRead: readAt != null,
  }));

  return {
    data: { notifications, unreadCount },
    pagination: {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  };
};
