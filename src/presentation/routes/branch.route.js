import express from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { verifyRole } from "../../middleware/verify.role.middleware";

const branchRouter = express.Router();

branchRouter.get(
  "/:businessId",
  authMiddleware,
  verifyRole([UserRoles["Super Admin"]]),
);
