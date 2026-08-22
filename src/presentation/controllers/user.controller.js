import UserUseCases from "../../usecases/user/index.js";

export const login = async (req, res, next) => {
  try {
    const data = await UserUseCases.LoginUserUseCase(req.body);
    res.status(200).json({ code: 1, data, message: "Login successful" });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const data = await UserUseCases.RegisterUserUseCase(req.user.id, req.body);
    res.status(201).json({ code: 0, data, message: "Invitation sent" });
  } catch (error) {
    next(error);
  }
};
