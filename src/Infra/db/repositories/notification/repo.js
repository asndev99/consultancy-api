import { prisma } from "../../prisma.client.js";

export async function CreateNotificationWithRecipients(payload, recipientIds) {
  return prisma.notification.create({
    data: {
      ...payload,
      recipients: {
        create: recipientIds.map((userId) => ({ userId })),
      },
    },
    select: { id: true },
  });
}

function buildUserNotificationWhere(userId, { isRead } = {}) {
  return {
    userId,
    Notification: { deletedAt: null },
    ...(isRead === true ? { readAt: { not: null } } : {}),
    ...(isRead === false ? { readAt: null } : {}),
  };
}

export async function CountNotificationsByUser(userId, filters = {}) {
  return prisma.notificationRecipient.count({
    where: buildUserNotificationWhere(userId, filters),
  });
}

export async function FindNotificationsByUser(
  userId,
  { isRead, skip, take } = {},
) {
  return prisma.notificationRecipient.findMany({
    where: buildUserNotificationWhere(userId, { isRead }),
    select: {
      readAt: true,
      Notification: {
        select: {
          id: true,
          eventType: true,
          screen: true,
          title: true,
          message: true,
          metadata: true,
          isFromSystem: true,
          businessId: true,
          branchId: true,
          createdAt: true,
          Actor: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    skip,
    take,
  });
}

// Only rows that belong to the user and are still unread, so re-reading keeps
// the original readAt.
export async function MarkNotificationsRead(userId, notificationIds, readAt) {
  return prisma.notificationRecipient.updateMany({
    where: {
      userId,
      notificationId: { in: notificationIds },
      readAt: null,
    },
    data: { readAt },
  });
}
