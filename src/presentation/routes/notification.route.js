import express from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { verifyRole } from "../../middleware/verify.role.middleware.js";
import { UserRoles } from "../../shared/application.constants.js";
import { getMyNotifications } from "../controllers/notification.controller.js";

const notificationRouter = express.Router();

// Every role can read the notifications addressed to them.
const notificationRoles = Object.values(UserRoles);

notificationRouter.get(
  "/",
  authMiddleware,
  verifyRole(notificationRoles),
  getMyNotifications,
);

export default notificationRouter;
