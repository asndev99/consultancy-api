import express from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import {
  createUser,
  deleteUser,
  login,
  updateUser,
  acceptInvite,
  resendInvite,
  cancelInvite,
  whoAmI,
  changePassword,
  assignUserBranch,
  refreshSession,
  logout,
  logoutAll,
  getMySessions,
  revokeMySession,
  deactivateUser,
  activateUser,
} from "../controllers/user.controller.js";
import { verifyRole } from "../../middleware/verify.role.middleware.js";
import { UserRoles } from "../../shared/application.constants.js";
import { validateBody } from "../../middleware/validate.payload.middleware.js";
import userSchemas from "../schema/user/index.js";

const userRouter = express.Router();

userRouter.post("/login", validateBody(userSchemas.LoginUserSchema), login);

// Public: the access token may already have expired when this is called.
userRouter.post(
  "/refresh",
  validateBody(userSchemas.RefreshSessionSchema),
  refreshSession,
);

userRouter.post("/logout", authMiddleware, logout);

userRouter.post("/logout-all", authMiddleware, logoutAll);

userRouter.get("/sessions", authMiddleware, getMySessions);

userRouter.delete("/sessions/:sessionId", authMiddleware, revokeMySession);

userRouter.post(
  "/accept-invite",
  validateBody(userSchemas.AcceptInviteSchema),
  acceptInvite,
);

userRouter.get("/whoami", authMiddleware, whoAmI);

userRouter.patch(
  "/change-password",
  authMiddleware,
  validateBody(userSchemas.ChangePasswordSchema),
  changePassword,
);

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

userRouter.post(
  "/resend-invite",
  authMiddleware,
  verifyRole([
    UserRoles["Business Admin"],
    UserRoles["Super Admin"],
    UserRoles["Manager"],
  ]),
  validateBody(userSchemas.ResendInviteSchema),
  resendInvite,
);

userRouter.patch(
  "/cancel-invite",
  authMiddleware,
  verifyRole([
    UserRoles["Business Admin"],
    UserRoles["Super Admin"],
    UserRoles["Manager"],
  ]),
  validateBody(userSchemas.CancelInviteSchema),
  cancelInvite,
);

userRouter.post(
  "/assign-branch",
  authMiddleware,
  verifyRole([UserRoles["Business Admin"], UserRoles["Super Admin"]]),
  validateBody(userSchemas.AssignUserBranchSchema),
  assignUserBranch,
);

userRouter.patch(
  "/deactivate",
  authMiddleware,
  verifyRole([UserRoles["Business Admin"], UserRoles["Super Admin"]]),
  validateBody(userSchemas.DeactivateUserSchema),
  deactivateUser,
);

userRouter.patch(
  "/activate",
  authMiddleware,
  verifyRole([UserRoles["Business Admin"], UserRoles["Super Admin"]]),
  validateBody(userSchemas.ActivateUserSchema),
  activateUser,
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
