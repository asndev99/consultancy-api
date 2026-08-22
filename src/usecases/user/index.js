import { RegisterUserUseCase } from "./register.user.usecase.js";
import { LoginUserUseCase } from "./login.user.usecase.js";
import { DeleteUserByBusinessUseCase } from "./delete.user.usecase.js";
import { UpdateUserUseCase } from "./update.user.usecase.js";

const UserUseCases = {
  RegisterUserUseCase,
  LoginUserUseCase,
  DeleteUserByBusinessUseCase,
  UpdateUserUseCase
};

export default UserUseCases;
