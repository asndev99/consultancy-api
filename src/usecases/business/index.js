import { GetBusinessManagersUseCase } from "./get.business.managers.usecase.js";
import { RegisterBusinessUseCase } from "./register.business.usecase.js";
import { GetUsersByBusinessUseCase } from "./get.users.by.business.usecase.js";
import { GetAdmissionTeamByBusinessUseCase } from "./get.admission.team.by.business.usecase.js";
import { GetBusinessPreferencesUseCase } from "./get.business.preferences.usecase.js";
import { UpdateBusinessPreferencesUseCase } from "./update.business.preferences.usecase.js";

const BusinessUseCases = {
  RegisterBusinessUseCase,
  GetBusinessManagersUseCase,
  GetUsersByBusinessUseCase,
  GetAdmissionTeamByBusinessUseCase,
  GetBusinessPreferencesUseCase,
  UpdateBusinessPreferencesUseCase,
};

export default BusinessUseCases;
