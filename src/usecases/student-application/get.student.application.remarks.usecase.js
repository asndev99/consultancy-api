import StudentApplicationRepository from "../../Infra/db/repositories/student-application/index.js";
import { NotFoundException } from "../../shared/error.js";

export const GetStudentApplicationRemarksUseCase = async (
  req,
  applicationId,
) => {
  const businessId = req.user.businessId || null;

  const application =
    await StudentApplicationRepository.FindStudentApplicationById(
      Number(applicationId),
      businessId,
    );

  if (!application) {
    throw new NotFoundException("Student application not found");
  }

  return StudentApplicationRepository.FindRemarksByApplicationId(
    application.id,
    businessId,
  );
};
