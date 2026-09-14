import express from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { verifyRole } from "../../middleware/verify.role.middleware.js";
import { UserRoles } from "../../shared/application.constants.js";
import { validateBody } from "../../middleware/validate.payload.middleware.js";
import documentSchemas from "../schema/document/index.js";
import {
  createDocumentTitle,
  getDocumentTitlesByStudent,
  editDocumentTitle,
  deleteDocumentTitle,
} from "../controllers/document.controller.js";

const documentRouter = express.Router();

const manageDocumentTitleRoles = [
  UserRoles["Manager"],
  UserRoles["Business Admin"],
  UserRoles["Counselor"],
  UserRoles["Sub Agent"],
];

documentRouter.post(
  "/titles",
  authMiddleware,
  verifyRole(manageDocumentTitleRoles),
  validateBody(documentSchemas.CreateDocumentTitleSchema),
  createDocumentTitle,
);

documentRouter.get(
  "/titles/student/:studentId",
  authMiddleware,
  verifyRole(manageDocumentTitleRoles),
  getDocumentTitlesByStudent,
);

documentRouter.patch(
  "/titles/:documentTitleId",
  authMiddleware,
  verifyRole(manageDocumentTitleRoles),
  validateBody(documentSchemas.EditDocumentTitleSchema),
  editDocumentTitle,
);

documentRouter.delete(
  "/titles/:documentTitleId",
  authMiddleware,
  verifyRole(manageDocumentTitleRoles),
  deleteDocumentTitle,
);

export default documentRouter;
