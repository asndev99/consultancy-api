import express from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { verifyRole } from "../../middleware/verify.role.middleware.js";
import { UserRoles } from "../../shared/application.constants.js";
import {
  getBranchesByBusiness,
  createBranch,
  updateBranch,
  deleteBranch,
} from "../controllers/branch.controller.js";

const branchRouter = express.Router();

const manageBranchRoles = [
  UserRoles["Business Admin"],
  UserRoles["Super Admin"],
];

branchRouter.get(
  "/:businessId",
  authMiddleware,
  verifyRole([UserRoles["Super Admin"]]),
  getBranchesByBusiness,
);

branchRouter.post(
  "/",
  authMiddleware,
  verifyRole(manageBranchRoles),
  createBranch,
);

branchRouter.patch(
  "/:branchId",
  authMiddleware,
  verifyRole(manageBranchRoles),
  updateBranch,
);

branchRouter.delete(
  "/:branchId",
  authMiddleware,
  verifyRole(manageBranchRoles),
  deleteBranch,
);

export default branchRouter;
