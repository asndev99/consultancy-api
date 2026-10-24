import express from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { verifyRole } from "../../middleware/verify.role.middleware.js";
import { UserRoles } from "../../shared/application.constants.js";
import {
  getBranchDashboardStats,
  getBranchTargetCountries,
  getBranchPipeline,
  getBranchUpcomingIntakes,
  getBranchLeadSources,
} from "../controllers/dashboard.controller.js";

const dashboardRouter = express.Router();

const viewDashboardRoles = [
  UserRoles.Counselor,
  UserRoles.Manager,
  UserRoles["Business Admin"],
];

dashboardRouter.get(
  "/branch/:branchId",
  authMiddleware,
  verifyRole(viewDashboardRoles),
  getBranchDashboardStats,
);

dashboardRouter.get(
  "/branch/:branchId/target-countries",
  authMiddleware,
  verifyRole(viewDashboardRoles),
  getBranchTargetCountries,
);

dashboardRouter.get(
  "/branch/:branchId/pipeline",
  authMiddleware,
  verifyRole(viewDashboardRoles),
  getBranchPipeline,
);

dashboardRouter.get(
  "/branch/:branchId/upcoming-intakes",
  authMiddleware,
  verifyRole(viewDashboardRoles),
  getBranchUpcomingIntakes,
);

dashboardRouter.get(
  "/branch/:branchId/lead-sources",
  authMiddleware,
  verifyRole(viewDashboardRoles),
  getBranchLeadSources,
);

export default dashboardRouter;
