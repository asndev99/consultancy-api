import BusinessUseCases from "../../usecases/business/index.js";

export const registerBusiness = async (req, res, next) => {
  try {
    const data = BusinessUseCases.RegisterBusinessUseCase(
      req.user.id,
      req.body,
    );
    return res.status(200).json({
      message: "Business Registered Successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getBranchManagersByBusiness = async (req, res, next) => {
  try {
    const data = await BusinessUseCases.GetBusinessManagersUseCase(
      req.params.businessId,
    );
    res.status(200).json({ code: 1, data, message: "Managers fetched" });
  } catch (error) {
    next(error);
  }
};

export const getUsersByBusiness = async (req, res, next) => {
  try {
    const data = await BusinessUseCases.GetUsersByBusinessUseCase(
      req.user.role,
      req.params.businessId,
      req.user.assignedBranches,
    );
    res.status(200).json({ code: 1, data, message: "Users fetched" });
  } catch (error) {
    next(error);
  }
};
