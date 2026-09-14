import BranchUseCases from "../../usecases/branch/index.js";

export const getBranchesByBusiness = async (req, res, next) => {
  try {
    const { page, pageSize, isActive } = req.query;
    const data = await BranchUseCases.GetBranchesByBusinessUseCase(
      req.user.businessId,
      page ? Number(page) : undefined,
      pageSize ? Number(pageSize) : undefined,
      {
        ...(isActive !== undefined ? { isActive: isActive === "true" } : {}),
      },
    );
    res.status(200).json({ code: 0, data, message: "Branches fetched" });
  } catch (error) {
    next(error);
  }
};

export const createBranch = async (req, res, next) => {
  try {
    const data = await BranchUseCases.CreateBranchUseCase(req, req.body);
    res.status(201).json({ code: 0, data, message: "Branch created" });
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
    res.status(200).json({ code: 0, data, message: "Branch updated" });
  } catch (error) {
    next(error);
  }
};

export const updateBranchStatus = async (req, res, next) => {
  try {
    const data = await BranchUseCases.UpdateBranchStatusUseCase(
      req,
      req.params.branchId,
      req.body.isActive,
    );
    res.status(200).json({ code: 0, data, message: "Branch status updated" });
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
    res.status(200).json({ code: 0, data, message: "Branch deleted" });
  } catch (error) {
    next(error);
  }
};

export const getCounselorsByBranch = async (req, res, next) => {
  try {
    const data = await BranchUseCases.GetCounselorsByBranchUseCase(
      req.query.organizationId,
      req.params.branchId,
    );
    res.status(200).json({ code: 0, data, message: "Counselors fetched" });
  } catch (error) {
    next(error);
  }
};
