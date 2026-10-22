import express from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { verifyRole } from "../../middleware/verify.role.middleware.js";
import { UserRoles } from "../../shared/application.constants.js";
import { validateBody } from "../../middleware/validate.payload.middleware.js";
import studentApplicationSchemas from "../schema/student-application/index.js";
import {
  createStudentApplication,
  getStudentApplications,
  getStudentApplicationsByBranch,
  getManagerApplicationsByBranch,
  getCounselorApplicationsByBranch,
  getAdmissionTeamApplicationsByBranch,
  getStudentApplicationDetails,
  getStudentApplicationRemarks,
  assignStudentApplication,
  editStudentApplication,
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
  "/branch/:branchId",
  authMiddleware,
  verifyRole([UserRoles["Business Admin"]]),
  getStudentApplicationsByBranch,
);

studentApplicationRouter.get(
  "/manager/branch/:branchId",
  authMiddleware,
  verifyRole([UserRoles["Manager"], UserRoles["Business Admin"]]),
  getManagerApplicationsByBranch,
);

studentApplicationRouter.get(
  "/counselor/branch/:branchId",
  authMiddleware,
  verifyRole([UserRoles["Counselor"]]),
  getCounselorApplicationsByBranch,
);

studentApplicationRouter.get(
  "/admission-team/branch/:branchId",
  authMiddleware,
  verifyRole([UserRoles["Admission Team"]]),
  getAdmissionTeamApplicationsByBranch,
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

studentApplicationRouter.patch(
  "/:applicationId",
  authMiddleware,
  verifyRole(manageStudentApplicationRoles),
  validateBody(studentApplicationSchemas.EditStudentApplicationSchema),
  editStudentApplication,
);

studentApplicationRouter.delete(
  "/:applicationId",
  authMiddleware,
  verifyRole(manageStudentApplicationRoles),
  deleteStudentApplication,
);

export default studentApplicationRouter;
