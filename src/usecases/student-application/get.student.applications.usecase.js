import StudentApplicationRepository from "../../Infra/db/repositories/student-application/index.js";

export const GetStudentApplicationsUseCase = async (
  req,
  studentId,
  branchId,
) => {
  return StudentApplicationRepository.FindStudentApplicationsByStudentAndBranch(
    req.user.businessId || null,
    Number(studentId),
    Number(branchId),
  );
};
