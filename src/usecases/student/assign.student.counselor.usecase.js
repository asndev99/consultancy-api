import StudentRepository from "../../Infra/db/repositories/student/index.js";
import UserRepository from "../../Infra/db/repositories/user/index.js";
import { UserRoles } from "../../shared/application.constants.js";
import { NotFoundException, BadRequestException } from "../../shared/error.js";

export const AssignStudentCounselorUseCase = async (req, payload) => {
  const businessId = req.user.businessId || null;
  const studentIds = [...new Set(payload.studentIds.map(Number))];
  const counselorId =
    payload.counselorId != null ? Number(payload.counselorId) : null;

  const existingStudents = await StudentRepository.FindActiveStudentsByIds(
    studentIds,
    businessId,
  );
  if (existingStudents.length !== studentIds.length) {
    throw new NotFoundException("One or more students were not found");
  }

  if (counselorId != null) {
    const counselor = await UserRepository.findUserById(counselorId);
    if (
      !counselor ||
      counselor.isDeleted ||
      (businessId != null && counselor.businessId !== businessId) ||
      counselor.role !== UserRoles.Counselor
    ) {
      throw new BadRequestException(
        "counselorId must reference an active Counselor in this business",
      );
    }
  }

  await StudentRepository.BulkUpdateStudentCounselor(
    studentIds,
    {
      counselorId,
      updatedBy: req.user.id,
    },
    businessId,
  );

  return { studentIds, counselorId };
};
