import express from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { verifyRole } from "../../middleware/verify.role.middleware.js";
import { UserRoles } from "../../shared/application.constants.js";
import { validateBody } from "../../middleware/validate.payload.middleware.js";
import studentApplicationSchemas from "../schema/student-application/index.js";
import {
  createStudentApplication,
  getStudentApplications,
  getStudentApplicationDetails,
  getStudentApplicationRemarks,
  assignStudentApplication,
  updateStudentApplicationStatus,
  deleteStudentApplication,
} from "../controllers/student-application.controller.js";

const studentApplicationRouter = express.Router();

const manageStudentApplicationRoles = [
  UserRoles["Manager"],
  UserRoles["Counselor"],
  UserRoles["Business Admin"],
];

studentApplicationRouter.post(
  "/",
  authMiddleware,
  verifyRole(manageStudentApplicationRoles),
  validateBody(studentApplicationSchemas.CreateStudentApplicationSchema),
  createStudentApplication,
);

studentApplicationRouter.get(
  "/student/:studentId/branch/:branchId",
  authMiddleware,
  verifyRole(manageStudentApplicationRoles),
  getStudentApplications,
);

studentApplicationRouter.get(
  "/:applicationId/remarks",
  authMiddleware,
  verifyRole(manageStudentApplicationRoles),
  getStudentApplicationRemarks,
);

studentApplicationRouter.get(
  "/:applicationId",
  authMiddleware,
  verifyRole(manageStudentApplicationRoles),
  getStudentApplicationDetails,
);

studentApplicationRouter.patch(
  "/:applicationId/assign",
  authMiddleware,
  verifyRole(manageStudentApplicationRoles),
  validateBody(studentApplicationSchemas.AssignStudentApplicationSchema),
  assignStudentApplication,
);

studentApplicationRouter.patch(
  "/:applicationId/status",
  authMiddleware,
  verifyRole(manageStudentApplicationRoles),
  validateBody(studentApplicationSchemas.UpdateStudentApplicationStatusSchema),
  updateStudentApplicationStatus,
);

studentApplicationRouter.delete(
  "/:applicationId",
  authMiddleware,
  verifyRole(manageStudentApplicationRoles),
  deleteStudentApplication,
);

export default studentApplicationRouter;
