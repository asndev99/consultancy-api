import { GetBranchesByBusinessUseCase } from "./get.branches.by.business.usecase.js";
import { CreateBranchUseCase } from "./create.branch.usecase.js";
import { UpdateBranchUseCase } from "./update.branch.usecase.js";
import { DeleteBranchUseCase } from "./delete.branch.usecase.js";

const BranchUseCases = {
  GetBranchesByBusinessUseCase,
  CreateBranchUseCase,
  UpdateBranchUseCase,
  DeleteBranchUseCase,
};

export default BranchUseCases;
