import { RefreshSessionUseCase } from "./refresh.session.usecase.js";
import { LogoutUseCase } from "./logout.usecase.js";
import { LogoutAllUseCase } from "./logout.all.usecase.js";
import { GetMySessionsUseCase } from "./get.my.sessions.usecase.js";
import { RevokeMySessionUseCase } from "./revoke.my.session.usecase.js";

const SessionUseCases = {
  RefreshSessionUseCase,
  LogoutUseCase,
  LogoutAllUseCase,
  GetMySessionsUseCase,
  RevokeMySessionUseCase,
};

export default SessionUseCases;
