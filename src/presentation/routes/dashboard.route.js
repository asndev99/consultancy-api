import express from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { verifyRole } from "../../middleware/verify.role.middleware.js";
import { UserRoles } from "../../shared/application.constants.js";
import {
  getDashboardSummary,
  getBranchStats,
  getDistribution,
  getSubAgentStats,
  getTrends,
} from "../controllers/dashboard.controller.js";

const dashboardRouter = express.Router();

const dashboardRoles = [UserRoles["Business Admin"]];

dashboardRouter.get(
  "/summary",
  authMiddleware,
  verifyRole(dashboardRoles),
  getDashboardSummary,
);

dashboardRouter.get(
  "/branches",
  authMiddleware,
  verifyRole(dashboardRoles),
  getBranchStats,
);

dashboardRouter.get(
  "/sub-agents",
  authMiddleware,
  verifyRole(dashboardRoles),
  getSubAgentStats,
);

dashboardRouter.get(
  "/distribution",
  authMiddleware,
  verifyRole(dashboardRoles),
  getDistribution,
);

dashboardRouter.get(
  "/trends",
  authMiddleware,
  verifyRole(dashboardRoles),
  getTrends,
);

export default dashboardRouter;
