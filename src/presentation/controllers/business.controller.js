import BusinessUseCases from "../../usecases/business/index.js";

export const registerBusiness = async (req, res, next) => {
  try {
    const data = BusinessUseCases.RegisterBusinessUseCase(req, req.body);
  } catch (error) {
    next(error);
  }
};
