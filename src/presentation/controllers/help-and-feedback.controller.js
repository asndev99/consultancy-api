import HelpAndFeedbackUseCases from "../../usecases/help-and-feedback/index.js";

export const createHelpAndFeedback = async (req, res, next) => {
  try {
    const data = await HelpAndFeedbackUseCases.CreateHelpAndFeedbackUseCase(
      req,
      req.body,
    );
    res
      .status(201)
      .json({ code: 0, data, message: "Help and feedback submitted" });
  } catch (error) {
    next(error);
  }
};
