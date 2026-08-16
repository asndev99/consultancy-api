import express from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { createUser, login } from "../controllers/user.controller.js";
import { verifyRole } from "../../middleware/verify.role.middleware.js";
import { UserRoles } from "../../shared/application.constants.js";

const userRouter = express.Router();

userRouter.post("/login", login);

userRouter.post(
  "/register",
  authMiddleware,
  verifyRole([UserRoles["Business Admin"], UserRoles["Super Admin"]]),
  createUser,
);

export default userRouter;
