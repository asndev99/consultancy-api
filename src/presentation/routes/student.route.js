import express from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { verifyRole } from "../../middleware/verify.role.middleware.js";
import { UserRoles } from "../../shared/application.constants.js";
import { validateBody } from "../../middleware/validate.payload.middleware.js";
import studentSchemas from "../schema/student/index.js";
import {
  createStudent,
  getStudentsByBranch,
  getTargetUniversities,
  addTargetUniversities,
  addTargetUniversityCourses,
  deleteTargetUniversity,
  deleteTargetUniversityCourse,
} from "../controllers/student.controller.js";

const studentRouter = express.Router();

const manageStudentRoles = [
  UserRoles["Sub Agent"],
  UserRoles["Counselor"],
  UserRoles["Manager"],
  UserRoles["Business Admin"],
];

studentRouter.post(
  "/",
  authMiddleware,
  verifyRole(manageStudentRoles),
  validateBody(studentSchemas.CreateStudentSchema),
  createStudent,
);

studentRouter.get(
  "/branch/:branchId",
  authMiddleware,
  verifyRole(manageStudentRoles),
  getStudentsByBranch,
);

studentRouter.get(
  "/:studentId/target-universities",
  authMiddleware,
  verifyRole(manageStudentRoles),
  getTargetUniversities,
);

studentRouter.post(
  "/:studentId/target-universities",
  authMiddleware,
  verifyRole(manageStudentRoles),
  validateBody(studentSchemas.AddTargetUniversitiesSchema),
  addTargetUniversities,
);

studentRouter.post(
  "/:studentId/target-universities/:targetUniversityId/courses",
  authMiddleware,
  verifyRole(manageStudentRoles),
  validateBody(studentSchemas.AddTargetUniversityCoursesSchema),
  addTargetUniversityCourses,
);

studentRouter.delete(
  "/:studentId/target-universities/:targetUniversityId",
  authMiddleware,
  verifyRole(manageStudentRoles),
  deleteTargetUniversity,
);

studentRouter.delete(
  "/:studentId/target-universities/:targetUniversityId/courses/:targetCourseId",
  authMiddleware,
  verifyRole(manageStudentRoles),
  deleteTargetUniversityCourse,
);

export default studentRouter;
