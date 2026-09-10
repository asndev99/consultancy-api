import express from "express";
import { verifyRole } from "../../middleware/verify.role.middleware.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { UserRoles } from "../../shared/application.constants.js";
import {
  addUniversityForBusiness,
  GetUniveristyByBusiness,
  getUniversityDetails,
  editUniversity,
  addUniversityCourse,
  editUniversityCourse,
  deleteUniversityCourse,
  addUniversityRequirement,
  editUniversityRequirement,
  deleteUniversityRequirement,
} from "../controllers/university.controller.js";
import { validateBody } from "../../middleware/validate.payload.middleware.js";
import universitySchemas from "../../presentation/schema/university/index.js";

const universityRouter = express.Router();

const manageUniversityRoles = [
  UserRoles["Business Admin"],
  UserRoles["Super Admin"],
  UserRoles["Manager"],
];

universityRouter.post(
  "/add",
  authMiddleware,
  verifyRole(manageUniversityRoles),
  validateBody(universitySchemas.AddUniversitySchema),
  addUniversityForBusiness,
);

universityRouter.post(
  "/course",
  authMiddleware,
  verifyRole(manageUniversityRoles),
  validateBody(universitySchemas.AddUniversityCourseSchema),
  addUniversityCourse,
);

universityRouter.patch(
  "/course/:courseId",
  authMiddleware,
  verifyRole(manageUniversityRoles),
  validateBody(universitySchemas.EditUniversityCourseSchema),
  editUniversityCourse,
);

universityRouter.delete(
  "/course/:courseId",
  authMiddleware,
  verifyRole(manageUniversityRoles),
  deleteUniversityCourse,
);

universityRouter.get(
  "/details/:universityId",
  authMiddleware,
  verifyRole(manageUniversityRoles),
  getUniversityDetails,
);

universityRouter.post(
  "/requirement",
  authMiddleware,
  verifyRole(manageUniversityRoles),
  addUniversityRequirement,
);

universityRouter.patch(
  "/requirement/:requirementId",
  authMiddleware,
  verifyRole(manageUniversityRoles),
  editUniversityRequirement,
);

universityRouter.delete(
  "/requirement/:requirementId",
  authMiddleware,
  verifyRole(manageUniversityRoles),
  deleteUniversityRequirement,
);

universityRouter.patch(
  "/:universityId",
  authMiddleware,
  verifyRole(manageUniversityRoles),
  validateBody(universitySchemas.EditUniversitySchema),
  editUniversity,
);

universityRouter.get(
  "/:businessId",
  authMiddleware,
  verifyRole(manageUniversityRoles),
  GetUniveristyByBusiness,
);

export default universityRouter;
