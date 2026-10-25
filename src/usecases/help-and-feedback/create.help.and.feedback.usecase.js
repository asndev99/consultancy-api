import HelpAndFeedbackRepository from "../../Infra/db/repositories/help-and-feedback/index.js";
import { BadRequestException } from "../../shared/error.js";

export const CreateHelpAndFeedbackUseCase = async (req, payload) => {
  const businessId = req.user.businessId;
  if (businessId == null) {
    throw new BadRequestException(
      "Help and feedback can only be submitted from a business account",
    );
  }

  return HelpAndFeedbackRepository.CreateHelpAndFeedback({
    subject: payload.subject.trim(),
    description: payload.description.trim(),
    category: payload.category,
    priorityLevel: payload.priorityLevel,
    businessId,
    userId: req.user.id,
  });
};
