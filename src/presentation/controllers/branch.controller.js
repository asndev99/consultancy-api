import BranchUseCases from "../../usecases/branch/index.js";

export const getBranchesByBusiness = async (req, res, next) => {
  try {
    const data = await BranchUseCases.GetBranchesByBusinessUseCase(
      req.params.businessId,
    );
    res.status(200).json({ code: 1, data, message: "Branches fetched" });
  } catch (error) {
    next(error);
  }
};

export const createBranch = async (req, res, next) => {
  try {
    const data = await BranchUseCases.CreateBranchUseCase(req, req.body);
    res.status(201).json({ code: 1, data, message: "Branch created" });
  } catch (error) {
    next(error);
  }
};

export const updateBranch = async (req, res, next) => {
  try {
    const data = await BranchUseCases.UpdateBranchUseCase(
      req,
      req.params.branchId,
      req.body,
    );
    res.status(200).json({ code: 1, data, message: "Branch updated" });
  } catch (error) {
    next(error);
  }
};

export const deleteBranch = async (req, res, next) => {
  try {
    const data = await BranchUseCases.DeleteBranchUseCase(
      req,
      req.params.branchId,
    );
    res.status(200).json({ code: 1, data, message: "Branch deleted" });
  } catch (error) {
    next(error);
  }
};

