import express from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { verifyRole } from "../../middleware/verify.role.middleware.js";
import { UserRoles } from "../../shared/application.constants.js";
import { validateBody } from "../../middleware/validate.payload.middleware.js";
import studentSchemas from "../schema/student/index.js";
import {
  createStudent,
  createSubAgentStudent,
  editStudent,
  assignStudentCounselor,
  getStudentsByBranch,
  getSubAgentStudentsByBranch,
  getStudentStatsByBranch,
  getStudentById,
  getTargetUniversities,
  updateTargetUniversities,
  addTargetUniversityCourses,
  deleteTargetUniversity,
  deleteTargetUniversityCourse,
  deleteStudent,
  bulkDeleteStudents,
} from "../controllers/student.controller.js";

const studentRouter = express.Router();

const manageStudentRoles = [
  UserRoles["Sub Agent"],
  UserRoles["Counselor"],
  UserRoles["Manager"],
  UserRoles["Business Admin"],
];

const manageStudentRecordRoles = [
  UserRoles["Manager"],
  UserRoles["Business Admin"],
];

// Sub Agents create students through POST /student/sub-agent instead.
studentRouter.post(
  "/",
  authMiddleware,
  verifyRole([
    UserRoles["Counselor"],
    UserRoles["Manager"],
    UserRoles["Business Admin"],
  ]),
  validateBody(studentSchemas.CreateStudentSchema),
  createStudent,
);

studentRouter.post(
  "/sub-agent",
  authMiddleware,
  verifyRole([UserRoles["Sub Agent"]]),
  validateBody(studentSchemas.CreateSubAgentStudentSchema),
  createSubAgentStudent,
);

// Sub Agents list their own students through GET /student/sub-agent/branch/:branchId.
studentRouter.get(
  "/branch/:branchId",
  authMiddleware,
  verifyRole([
    UserRoles["Counselor"],
    UserRoles["Manager"],
    UserRoles["Business Admin"],
  ]),
  getStudentsByBranch,
);

studentRouter.get(
  "/branch/:branchId/stats",
  authMiddleware,
  verifyRole(manageStudentRoles),
  getStudentStatsByBranch,
);

// Registered before "/:studentId/branch/:branchId" so "sub-agent" isn't
// matched as a studentId.
studentRouter.get(
  "/sub-agent/branch/:branchId",
  authMiddleware,
  verifyRole([UserRoles["Sub Agent"]]),
  getSubAgentStudentsByBranch,
);

studentRouter.get(
  "/:studentId/branch/:branchId",
  authMiddleware,
  verifyRole(manageStudentRoles),
  getStudentById,
);

// Registered before "/:studentId" so "counselor" isn't matched as a studentId param.
studentRouter.patch(
  "/counselor",
  authMiddleware,
  verifyRole(manageStudentRecordRoles),
  validateBody(studentSchemas.AssignStudentCounselorSchema),
  assignStudentCounselor,
);

// Registered before "/:studentId" so "bulk" isn't matched as a studentId param.
studentRouter.delete(
  "/bulk",
  authMiddleware,
  verifyRole(manageStudentRoles),
  validateBody(studentSchemas.BulkDeleteStudentsSchema),
  bulkDeleteStudents,
);

studentRouter.delete(
  "/:studentId",
  authMiddleware,
  verifyRole(manageStudentRoles),
  deleteStudent,
);

studentRouter.patch(
  "/:studentId",
  authMiddleware,
  verifyRole(manageStudentRecordRoles),
  validateBody(studentSchemas.EditStudentSchema),
  editStudent,
);

studentRouter.get(
  "/:studentId/target-universities",
  authMiddleware,
  verifyRole(manageStudentRoles),
  getTargetUniversities,
);

studentRouter.patch(
  "/:studentId/target-universities",
  authMiddleware,
  verifyRole(manageStudentRoles),
  validateBody(studentSchemas.UpdateTargetUniversitiesSchema),
  updateTargetUniversities,
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
