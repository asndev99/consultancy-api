import StudentApplicationRepository from "../../Infra/db/repositories/student-application/index.js";
import { NotFoundException } from "../../shared/error.js";

export const GetStudentApplicationDetailsUseCase = async (
  req,
  applicationId,
) => {
  const application =
    await StudentApplicationRepository.FindStudentApplicationDetailsById(
      Number(applicationId),
      req.user.businessId || null,
    );

  if (!application) {
    throw new NotFoundException("Student application not found");
  }

  return application;
};
