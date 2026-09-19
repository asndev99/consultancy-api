import StudentApplicationRepository from "../../Infra/db/repositories/student-application/index.js";

export const DeleteStudentApplicationUseCase = async (req, applicationId) => {
  return StudentApplicationRepository.DeleteStudentApplication(
    Number(applicationId),
    {
      isActive: false,
      deletedAt: new Date(),
      deletedBy: req.user.id,
    },
    req.user.businessId || null,
  );
};
