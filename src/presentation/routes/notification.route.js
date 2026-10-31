import express from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { verifyRole } from "../../middleware/verify.role.middleware.js";
import { UserRoles } from "../../shared/application.constants.js";
import { validateBody } from "../../middleware/validate.payload.middleware.js";
import notificationSchemas from "../schema/notification/index.js";
import {
  getMyNotifications,
  markNotificationsRead,
} from "../controllers/notification.controller.js";

const notificationRouter = express.Router();

// Every role can read the notifications addressed to them.
const notificationRoles = Object.values(UserRoles);

notificationRouter.get(
  "/",
  authMiddleware,
  verifyRole(notificationRoles),
  getMyNotifications,
);

notificationRouter.patch(
  "/read",
  authMiddleware,
  verifyRole(notificationRoles),
  validateBody(notificationSchemas.MarkNotificationsReadSchema),
  markNotificationsRead,
);

export default notificationRouter;
