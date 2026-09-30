import StudentApplicationRepository from "../../Infra/db/repositories/student-application/index.js";
import StudentApplicationRemarksRepository from "../../Infra/db/repositories/student-application-remarks/index.js";
import { NotFoundException } from "../../shared/error.js";

export const CreateStudentApplicationRemarkUseCase = async (
  req,
  applicationId,
  comment,
) => {
  const application =
    await StudentApplicationRepository.FindStudentApplicationById(
      Number(applicationId),
      req.user.businessId || null,
    );

  if (!application) {
    throw new NotFoundException("Student application not found");
  }

  return StudentApplicationRemarksRepository.CreateStudentApplicationRemark({
    applicationId: application.id,
    comment,
    authorId: req.user.id,
  });
};
