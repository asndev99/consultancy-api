import UserUseCases from "../../usecases/user/index.js";

export const login = async (req, res, next) => {
  try {
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const data = await UserUseCases.RegisterUserUseCase(req, req.body);
    res.status(201).json({ code: 0, data, message: "Invitation sent" });
  } catch (error) {
    next(error);
  }
};
