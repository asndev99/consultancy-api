import express from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { verifyRole } from "../../middleware/verify.role.middleware.js";
import { UserRoles } from "../../shared/application.constants.js";
import { validateBody } from "../../middleware/validate.payload.middleware.js";
import subAgentSchemas from "../schema/sub-agent/index.js";
import {
  registerSubAgent,
  getSubAgentsByBranch,
  assignSubAgentBranch,
  editSubAgent,
  updateSubAgentStatus,
} from "../controllers/sub-agent.controller.js";

const subAgentRouter = express.Router();

const manageSubAgentRoles = [
  UserRoles["Business Admin"],
  UserRoles["Super Admin"],
  UserRoles["Manager"],
];

subAgentRouter.post(
  "/register",
  authMiddleware,
  verifyRole(manageSubAgentRoles),
  validateBody(subAgentSchemas.RegisterSubAgentSchema),
  registerSubAgent,
);

subAgentRouter.post(
  "/assign-branch",
  authMiddleware,
  verifyRole([UserRoles["Business Admin"], UserRoles["Super Admin"]]),
  validateBody(subAgentSchemas.AssignSubAgentBranchSchema),
  assignSubAgentBranch,
);

subAgentRouter.get(
  "/branch/:branchId",
  authMiddleware,
  verifyRole(manageSubAgentRoles),
  getSubAgentsByBranch,
);

// :subAgentId is the SubAgentBranchProfile id returned by the list endpoint.
subAgentRouter.patch(
  "/:subAgentId/status",
  authMiddleware,
  verifyRole(manageSubAgentRoles),
  validateBody(subAgentSchemas.UpdateSubAgentStatusSchema),
  updateSubAgentStatus,
);

subAgentRouter.patch(
  "/:subAgentId",
  authMiddleware,
  verifyRole(manageSubAgentRoles),
  validateBody(subAgentSchemas.EditSubAgentSchema),
  editSubAgent,
);

export default subAgentRouter;
