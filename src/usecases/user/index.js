import { RegisterUserUseCase } from "./register.user.usecase.js";
import { LoginUserUseCase } from "./login.user.usecase.js";
import { DeleteUserByBusinessUseCase } from "./delete.user.usecase.js";
import { UpdateUserUseCase } from "./update.user.usecase.js";
import { AcceptInviteUseCase } from "./accept.invite.usecase.js";
import { ResendInviteUseCase } from "./resend.invite.usecase.js";
import { CancelInviteUseCase } from "./cancel.invite.usecase.js";
import { DeactivateUserUseCase } from "./deactivate.user.usecase.js";
import { ActivateUserUseCase } from "./activate.user.usecase.js";
import { WhoAmIUseCase } from "./who.am.i.usecase.js";
import { ChangePasswordUseCase } from "./change.password.usecase.js";
import { AssignUserBranchUseCase } from "./assign.user.branch.usecase.js";
import { GetMyProfileUseCase } from "./get.my.profile.usecase.js";
import { UpdateMyProfileUseCase } from "./update.my.profile.usecase.js";

const UserUseCases = {
  RegisterUserUseCase,
  LoginUserUseCase,
  DeleteUserByBusinessUseCase,
  UpdateUserUseCase,
  AcceptInviteUseCase,
  ResendInviteUseCase,
  CancelInviteUseCase,
  DeactivateUserUseCase,
  ActivateUserUseCase,
  WhoAmIUseCase,
  ChangePasswordUseCase,
  AssignUserBranchUseCase,
  GetMyProfileUseCase,
  UpdateMyProfileUseCase,
};

export default UserUseCases;
