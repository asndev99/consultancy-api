import { RegisterUserUseCase } from "./register.user.usecase.js";
import { LoginUserUseCase } from "./login.user.usecase.js";
import { DeleteUserByBusinessUseCase } from "./delete.user.usecase.js";
import { UpdateUserUseCase } from "./update.user.usecase.js";
import { AcceptInviteUseCase } from "./accept.invite.usecase.js";
import { ResendInviteUseCase } from "./resend.invite.usecase.js";

const UserUseCases = {
  RegisterUserUseCase,
  LoginUserUseCase,
  DeleteUserByBusinessUseCase,
  UpdateUserUseCase,
  AcceptInviteUseCase,
  ResendInviteUseCase,
};

export default UserUseCases;
