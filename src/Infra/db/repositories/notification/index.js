import {
  CreateNotificationWithRecipients,
  CountNotificationsByUser,
  FindNotificationsByUser,
  MarkNotificationsRead,
} from "./repo.js";

const NotificationRawRepository = {
  CreateNotificationWithRecipients,
  CountNotificationsByUser,
  FindNotificationsByUser,
  MarkNotificationsRead,
};

const NotificationRepository = new Proxy(NotificationRawRepository, {
  get(target, methodName) {
    const originalMethod = target[methodName];

    if (typeof originalMethod !== "function") {
      return originalMethod;
    }

    return function (...args) {
      console.log(
        `[Notification Repository] calling "${String(methodName)}" with:`,
        args,
      );
      return originalMethod.apply(this, args);
    };
  },
});

export default NotificationRepository;
