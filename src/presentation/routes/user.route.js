import express from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import {
  createUser,
  deleteUser,
  login,
  updateUser,
} from "../controllers/user.controller.js";
import { verifyRole } from "../../middleware/verify.role.middleware.js";
import { UserRoles } from "../../shared/application.constants.js";
import { validateBody } from "../../middleware/validate.payload.middleware.js";
import userSchemas from "../schema/user/index.js";

const userRouter = express.Router();

userRouter.post("/login", login);

userRouter.post(
  "/register",
  authMiddleware,
  verifyRole([
    UserRoles["Business Admin"],
    UserRoles["Super Admin"],
    UserRoles["Manager"],
  ]),
  validateBody(userSchemas.RegisterUserSchema),
  createUser,
);

userRouter.patch(
  "/delete",
  authMiddleware,
  verifyRole([UserRoles["Business Admin"], UserRoles["Super Admin"]]),
  validateBody(userSchemas.DeleteUserSchema),
  deleteUser,
);

userRouter.patch(
  "/update/:id",
  authMiddleware,
  verifyRole([UserRoles["Business Admin"], UserRoles["Super Admin"]]),
  validateBody(userSchemas.UpdateUserSchema),
  updateUser,
);

export default userRouter;
