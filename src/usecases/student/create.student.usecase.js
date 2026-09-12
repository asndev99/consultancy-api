import BusinessRepository from "../../Infra/db/repositories/business/index.js";
import BranchRepository from "../../Infra/db/repositories/branch/index.js";
import StudentRepository from "../../Infra/db/repositories/student/index.js";
import UserRepository from "../../Infra/db/repositories/user/index.js";
import { BadRequestException, NotFoundException } from "../../shared/error.js";
import { generateStudentCode } from "../../shared/utils.js";
import { UserRoles } from "../../shared/application.constants.js";

export const CreateStudentUseCase = async (req, payload) => {
  const existingStudent =
    await StudentRepository.FindStudentByBusinessBranchEmailPhone(
      payload.businessId,
      payload.branchId,
      payload.email,
      payload.phoneNo,
    );
    
  if (existingStudent) {
    throw new BadRequestException(
      "Student with this email and phone number already exists on this branch",
    );
  }

  if (payload.counselorId) {
    const counselor = await UserRepository.findUserById(payload.counselorId);
    if (
      !counselor ||
      counselor.isDeleted ||
      counselor.businessId !== payload.businessId ||
      counselor.role !== UserRoles.Counselor
    ) {
      throw new BadRequestException(
        "counselorId must reference an active Counselor in this business",
      );
    }
  }

  const { studentSequence, businessCode } =
    await BusinessRepository.IncrementStudentSequence(payload.businessId);

  return StudentRepository.CreateStudent({
    ...payload,
    studentNo: generateStudentCode(businessCode, studentSequence),
    createdBy: req.user.id,
  });
};
