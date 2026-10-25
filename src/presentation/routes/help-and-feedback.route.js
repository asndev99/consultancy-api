import express from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { verifyRole } from "../../middleware/verify.role.middleware.js";
import { UserRoles } from "../../shared/application.constants.js";
import { validateBody } from "../../middleware/validate.payload.middleware.js";
import helpAndFeedbackSchemas from "../schema/help-and-feedback/index.js";
import { createHelpAndFeedback } from "../controllers/help-and-feedback.controller.js";

const helpAndFeedbackRouter = express.Router();

const submitHelpAndFeedbackRoles = [
  UserRoles["Business Admin"],
  UserRoles.Manager,
];

helpAndFeedbackRouter.post(
  "/",
  authMiddleware,
  verifyRole(submitHelpAndFeedbackRoles),
  validateBody(helpAndFeedbackSchemas.CreateHelpAndFeedbackSchema),
  createHelpAndFeedback,
);

export default helpAndFeedbackRouter;
