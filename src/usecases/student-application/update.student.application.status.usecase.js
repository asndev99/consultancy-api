import StudentApplicationRepository from "../../Infra/db/repositories/student-application/index.js";
import { NotFoundException } from "../../shared/error.js";
import { ApplicationStatus } from "../../shared/application.constants.js";

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
      // Stamped the first time the application leaves Draft.
      ...(application.applicationSubmittedAt == null &&
      applicationStatus !== ApplicationStatus.Draft
        ? { applicationSubmittedAt: new Date() }
        : {}),
      updatedBy: req.user.id,
    },
    businessId,
  );
};
