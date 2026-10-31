import UserUseCases from "../../usecases/user/index.js";
import SessionUseCases from "../../usecases/session/index.js";

export const login = async (req, res, next) => {
  try {
    const data = await UserUseCases.LoginUserUseCase(req.body, {
      userAgent: req.get("user-agent"),
      ipAddress: req.ip,
    });
    res.status(200).json({ code: 1, data, message: "Login successful" });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const data = await UserUseCases.RegisterUserUseCase(req.user.id, req.body);
    res.status(201).json({ code: 0, data, message: "Invitation sent" });
  } catch (error) {
    next(error);
  }
};

export const acceptInvite = async (req, res, next) => {
  try {
    const data = await UserUseCases.AcceptInviteUseCase(
      req.query.token,
      req.body.password,
    );
    res
      .status(200)
      .json({ code: 1, data, message: "Invite accepted successfully" });
  } catch (error) {
    next(error);
  }
};

export const whoAmI = async (req, res, next) => {
  try {
    const data = await UserUseCases.WhoAmIUseCase(req);
    res.status(200).json({ code: 0, data, message: "User fetched" });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const data = await UserUseCases.ChangePasswordUseCase(
      req,
      req.body.currentPassword,
      req.body.newPassword,
    );
    res
      .status(200)
      .json({ code: 0, data, message: "Password changed successfully" });
  } catch (error) {
    next(error);
  }
};

export const assignUserBranch = async (req, res, next) => {
  try {
    const data = await UserUseCases.AssignUserBranchUseCase(
      req,
      req.body.userId,
      req.body.branchId,
    );
    res
      .status(201)
      .json({ code: 0, data, message: "User assigned to branch" });
  } catch (error) {
    next(error);
  }
};

export const resendInvite = async (req, res, next) => {
  try {
    const data = await UserUseCases.ResendInviteUseCase(req, req.body.userId);
    res.status(200).json({
      code: 1,
      data: { id: data.id, email: data.email, inviteSentAt: data.inviteSentAt },
      message: "Invite resent",
    });
  } catch (error) {
    next(error);
  }
};

export const cancelInvite = async (req, res, next) => {
  try {
    const data = await UserUseCases.CancelInviteUseCase(req, req.body.userId);
    res.status(200).json({
      code: 0,
      data: { id: data.id, deletedAt: data.deletedAt },
      message: "Invite cancelled",
    });
  } catch (error) {
    next(error);
  }
};

export const deactivateUser = async (req, res, next) => {
  try {
    const data = await UserUseCases.DeactivateUserUseCase(
      req,
      req.body.userId,
    );
    res.status(200).json({ code: 0, data, message: "User deactivated" });
  } catch (error) {
    next(error);
  }
};

export const activateUser = async (req, res, next) => {
  try {
    const data = await UserUseCases.ActivateUserUseCase(req, req.body.userId);
    res.status(200).json({ code: 0, data, message: "User activated" });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const data = await UserUseCases.DeleteUserByBusinessUseCase(
      req.user.id,
      req.body.userId,
      req.user.businessId || null,
    );
    res
      .status(200)
      .json({ code: 0, data, message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const data = await UserUseCases.UpdateUserUseCase(
      req.user.id,
      +req.params.id,
      req.user.businessId,
      req.body,
    );
    res
      .status(200)
      .json({ code: 0, data, message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const refreshSession = async (req, res, next) => {
  try {
    const data = await SessionUseCases.RefreshSessionUseCase(
      req.body.refreshToken,
    );
    res.status(200).json({ code: 0, data, message: "Session refreshed" });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const data = await SessionUseCases.LogoutUseCase(req);
    res.status(200).json({ code: 0, data, message: "Logged out" });
  } catch (error) {
    next(error);
  }
};

export const logoutAll = async (req, res, next) => {
  try {
    const data = await SessionUseCases.LogoutAllUseCase(req);
    res
      .status(200)
      .json({ code: 0, data, message: "Logged out from all devices" });
  } catch (error) {
    next(error);
  }
};

export const getMySessions = async (req, res, next) => {
  try {
    const data = await SessionUseCases.GetMySessionsUseCase(req);
    res.status(200).json({ code: 0, data, message: "Sessions fetched" });
  } catch (error) {
    next(error);
  }
};

export const revokeMySession = async (req, res, next) => {
  try {
    const data = await SessionUseCases.RevokeMySessionUseCase(
      req,
      req.params.sessionId,
    );
    res.status(200).json({ code: 0, data, message: "Session revoked" });
  } catch (error) {
    next(error);
  }
};
