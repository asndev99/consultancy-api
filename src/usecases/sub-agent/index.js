import { RegisterSubAgentUseCase } from "./register.sub.agent.usecase.js";
import { GetSubAgentsByBranchUseCase } from "./get.sub.agents.by.branch.usecase.js";
import { AssignSubAgentBranchUseCase } from "./assign.sub.agent.branch.usecase.js";
import { EditSubAgentUseCase } from "./edit.sub.agent.usecase.js";
import { UpdateSubAgentStatusUseCase } from "./update.sub.agent.status.usecase.js";

const SubAgentUseCases = {
  RegisterSubAgentUseCase,
  GetSubAgentsByBranchUseCase,
  AssignSubAgentBranchUseCase,
  EditSubAgentUseCase,
  UpdateSubAgentStatusUseCase,
};

export default SubAgentUseCases;
