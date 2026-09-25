import express from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { verifyRole } from "../../middleware/verify.role.middleware.js";
import { UserRoles } from "../../shared/application.constants.js";
import { validateBody } from "../../middleware/validate.payload.middleware.js";
import branchSchemas from "../schema/branch/index.js";
import {
  getBranchesByBusiness,
  createBranch,
  updateBranch,
  updateBranchStatus,
  deleteBranch,
  getCounselorsByBranch,
  getUsersByBranchAndRole,
} from "../controllers/branch.controller.js";

const branchRouter = express.Router();

const manageBranchRoles = [
  UserRoles["Business Admin"],
  UserRoles["Super Admin"],
];

const viewBranchCounselorsRoles = [
  UserRoles["Manager"],
  UserRoles["Business Admin"],
];

branchRouter.get(
  "/",
  authMiddleware,
  verifyRole([UserRoles["Business Admin"]]),
  getBranchesByBusiness,
);

branchRouter.post(
  "/",
  authMiddleware,
  verifyRole(manageBranchRoles),
  validateBody(branchSchemas.CreateBranchSchema),
  createBranch,
);

branchRouter.patch(
  "/:branchId/status",
  authMiddleware,
  verifyRole(manageBranchRoles),
  validateBody(branchSchemas.UpdateBranchStatusSchema),
  updateBranchStatus,
);

branchRouter.patch(
  "/:branchId",
  authMiddleware,
  verifyRole(manageBranchRoles),
  validateBody(branchSchemas.UpdateBranchSchema),
  updateBranch,
);

branchRouter.delete(
  "/:branchId",
  authMiddleware,
  verifyRole(manageBranchRoles),
  deleteBranch,
);

branchRouter.get(
  "/:branchId/counselors",
  authMiddleware,
  verifyRole(viewBranchCounselorsRoles),
  getCounselorsByBranch,
);

branchRouter.get(
  "/users",
  authMiddleware,
  verifyRole(Object.values(UserRoles)),
  getUsersByBranchAndRole,
);

export default branchRouter;
