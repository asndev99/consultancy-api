import express from "express";
import { verifyRole } from "../../middleware/verify.role.middleware.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { addUniversityForBusiness } from "../controllers/university.controller.js";
const universityRouter = express.Router();

universityRouter.post(
  "/add",
  authMiddleware,
  verifyRole("Business Admin"),
  addUniversityForBusiness,
);



export default universityRouter;