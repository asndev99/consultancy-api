import StudentRepository from "../../Infra/db/repositories/student/index.js";
import { NotFoundException } from "../../shared/error.js";

export const BulkDeleteStudentsUseCase = async (req, payload) => {
  const businessId = req.user.businessId || null;
  const studentIds = [...new Set(payload.studentIds.map(Number))];

  // All-or-nothing: reject the whole request if any ID is missing, already
  // deleted, or outside the caller's business.
  const existingStudents = await StudentRepository.FindActiveStudentsByIds(
    studentIds,
    businessId,
  );
  if (existingStudents.length !== studentIds.length) {
    throw new NotFoundException("One or more students were not found");
  }

  const { count } = await StudentRepository.SoftDeleteStudents(
    studentIds,
    req.user.id,
    businessId,
  );

  return { studentIds, deletedCount: count };
};
