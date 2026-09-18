import express from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { verifyRole } from "../../middleware/verify.role.middleware.js";
import { UserRoles } from "../../shared/application.constants.js";
import {
  getBranchManagersByBusiness,
  registerBusiness,
  getUsersByBusiness,
  getAdmissionTeamByBusiness,
} from "../controllers/business.controller.js";

const businessRouter = express.Router();

businessRouter.post(
  "/register",
  authMiddleware,
  verifyRole([UserRoles["Super Admin"]]),
  registerBusiness,
);

businessRouter.get(
  "/list-managers/:businessId",
  authMiddleware,
  verifyRole([UserRoles["Super Admin"], UserRoles["Business Admin"]]),
  getBranchManagersByBusiness,
);

businessRouter.get(
  "/users/:businessId",
  authMiddleware,
  verifyRole([UserRoles["Business Admin"], UserRoles["Manager"]]),
  getUsersByBusiness,
);

businessRouter.get(
  "/admission-team/:businessId",
  authMiddleware,
  verifyRole([
    UserRoles["Super Admin"],
    UserRoles["Business Admin"],
    UserRoles["Manager"],
    UserRoles["Counselor"],
  ]),
  getAdmissionTeamByBusiness,
);

export default businessRouter;
