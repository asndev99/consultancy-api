import express from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { verifyRole } from "../../middleware/verify.role.middleware.js";
import { UserRoles } from "../../shared/application.constants.js";
import { validateBody } from "../../middleware/validate.payload.middleware.js";
import leadFormSchemas from "../schema/lead-form/index.js";
import {
  createLeadForm,
  getLeadForms,
  editLeadForm,
  deleteLeadForm,
  getPublicLeadForm,
} from "../controllers/lead-form.controller.js";

const leadFormRouter = express.Router();

const manageLeadFormRoles = [
  UserRoles["Manager"],
  UserRoles["Business Admin"],
];

// Public: no auth. Fine to serve without a token since only name,
// targetDegreeLevel, and targetCountries are exposed.
leadFormRouter.get("/public/:publicId", getPublicLeadForm);

leadFormRouter.post(
  "/",
  authMiddleware,
  verifyRole(manageLeadFormRoles),
  validateBody(leadFormSchemas.CreateLeadFormSchema),
  createLeadForm,
);

// branchId is an optional query param filter; omit it to get every lead
// form in the caller's business.
leadFormRouter.get(
  "/",
  authMiddleware,
  verifyRole(manageLeadFormRoles),
  getLeadForms,
);

leadFormRouter.patch(
  "/:leadFormId",
  authMiddleware,
  verifyRole(manageLeadFormRoles),
  validateBody(leadFormSchemas.EditLeadFormSchema),
  editLeadForm,
);

leadFormRouter.delete(
  "/:leadFormId",
  authMiddleware,
  verifyRole(manageLeadFormRoles),
  deleteLeadForm,
);

export default leadFormRouter;
