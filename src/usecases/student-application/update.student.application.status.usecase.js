import StudentApplicationRepository from "../../Infra/db/repositories/student-application/index.js";
import { NotFoundException } from "../../shared/error.js";

export const UpdateStudentApplicationStatusUseCase = async (
  req,
  applicationId,
  applicationStatus,
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

  return StudentApplicationRepository.UpdateStudentApplicationStatus(
    application.id,
    {
      applicationStatus,
      updatedBy: req.user.id,
    },
    businessId,
  );
};
