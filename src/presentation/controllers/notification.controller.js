import NotificationUseCases from "../../usecases/notification/index.js";
import { BadRequestException } from "../../shared/error.js";

const parseIsRead = (value) => {
  if (value == null || value === "") return undefined;
  if (value === "true") return true;
  if (value === "false") return false;
  throw new BadRequestException("isRead must be true or false");
};

export const getMyNotifications = async (req, res, next) => {
  try {
    const { page, pageSize, isRead } = req.query;
    const { data, pagination } =
      await NotificationUseCases.GetMyNotificationsUseCase(req, {
        page: page ? Number(page) : undefined,
        pageSize: pageSize ? Number(pageSize) : undefined,
        isRead: parseIsRead(isRead),
      });
    res
      .status(200)
      .json({ code: 0, data, pagination, message: "Notifications fetched" });
  } catch (error) {
    next(error);
  }
};

// 202: the update is queued, not yet applied.
export const markNotificationsRead = async (req, res, next) => {
  try {
    const data = await NotificationUseCases.MarkNotificationsReadUseCase(
      req,
      req.body,
    );
    res.status(202).json({
      code: 0,
      data,
      message: "Notifications queued to be marked as read",
    });
  } catch (error) {
    next(error);
  }
};
