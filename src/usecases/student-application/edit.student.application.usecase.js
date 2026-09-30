import StudentApplicationRepository from "../../Infra/db/repositories/student-application/index.js";
import { NotFoundException } from "../../shared/error.js";

export const EditStudentApplicationUseCase = async (
  req,
  applicationId,
  payload,
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

  return StudentApplicationRepository.EditStudentApplication(
    application.id,
    {
      ...payload,
      updatedBy: req.user.id,
    },
    businessId,
  );
};
