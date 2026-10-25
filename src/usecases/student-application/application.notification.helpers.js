import StudentRepository from "../../Infra/db/repositories/student/index.js";

// Notification.branchId is required but StudentApplication.branchId is
// nullable, so fall back to the student's branch.
export const resolveApplicationBranchId = async (application) => {
  if (application.branchId != null) {
    return application.branchId;
  }

  const student = await StudentRepository.FindStudentById(
    application.studentId,
    application.businessId,
  );
  return student?.branchId ?? null;
};

// Everyone assigned to the application, minus the user who acted.
export const getApplicationStakeholderIds = (application, actorId) => [
  ...new Set(
    [
      application.managerId,
      application.counselorId,
      application.subAgentId,
      application.admissionOfficerId,
    ].filter((userId) => userId != null && userId !== actorId),
  ),
];
