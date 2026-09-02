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
    const { name, branchId, page, pageSize } = req.query;
    const { data, pagination } = await BusinessUseCases.GetUsersByBusinessUseCase({
      role: req.user.role,
      businessId: req.params.businessId,
      userId: req.user.id,
      name: name || undefined,
      branchId,
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
    });
    res
      .status(200)
      .json({ code: 1, data, pagination, message: "Users fetched" });
  } catch (error) {
    next(error);
  }
};
