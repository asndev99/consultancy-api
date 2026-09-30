import express from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { verifyRole } from "../../middleware/verify.role.middleware.js";
import { UserRoles } from "../../shared/application.constants.js";
import { validateBody } from "../../middleware/validate.payload.middleware.js";
import studentApplicationRemarksSchemas from "../schema/student-application-remarks/index.js";
import {
  createStudentApplicationRemark,
  updateStudentApplicationRemark,
  deleteStudentApplicationRemark,
} from "../controllers/student-application-remarks.controller.js";

const studentApplicationRemarksRouter = express.Router();

const remarkRoles = [
  UserRoles["Manager"],
  UserRoles["Counselor"],
  UserRoles["Business Admin"],
  UserRoles["Admission Team"],
];

studentApplicationRemarksRouter.post(
  "/",
  authMiddleware,
  verifyRole(remarkRoles),
  validateBody(
    studentApplicationRemarksSchemas.CreateStudentApplicationRemarkSchema,
  ),
  createStudentApplicationRemark,
);

studentApplicationRemarksRouter.patch(
  "/:remarkId",
  authMiddleware,
  verifyRole(remarkRoles),
  validateBody(
    studentApplicationRemarksSchemas.UpdateStudentApplicationRemarkSchema,
  ),
  updateStudentApplicationRemark,
);

studentApplicationRemarksRouter.delete(
  "/:remarkId",
  authMiddleware,
  verifyRole(remarkRoles),
  deleteStudentApplicationRemark,
);

export default studentApplicationRemarksRouter;
