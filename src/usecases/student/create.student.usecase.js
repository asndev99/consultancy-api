import BusinessRepository from "../../Infra/db/repositories/business/index.js";
import BranchRepository from "../../Infra/db/repositories/branch/index.js";
import StudentRepository from "../../Infra/db/repositories/student/index.js";
import UserRepository from "../../Infra/db/repositories/user/index.js";
import { BadRequestException, NotFoundException } from "../../shared/error.js";
import { generateStudentCode } from "../../shared/utils.js";
import { enqueueNotification } from "../../Infra/queue/notification.queue.js";
import {
  UserRoles,
  NotificationEventType,
  NotificationScreen,
} from "../../shared/application.constants.js";

const rolesNotifyingManagersOnCreate = [
  UserRoles.Counselor,
  UserRoles["Sub Agent"],
];

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

  const student = await StudentRepository.CreateStudent({
    ...payload,
    studentNo: generateStudentCode(businessCode, studentSequence),
    createdBy: req.user.id,
  });

  if (rolesNotifyingManagersOnCreate.includes(req.user.role)) {
    const managers = await UserRepository.FindUsersByBranchAndRole(
      student.businessId,
      student.branchId,
      UserRoles.Manager,
    );

    if (managers.length > 0) {
      await enqueueNotification({
        eventType: NotificationEventType.StudentCreated,
        screen: NotificationScreen.StudentProfile,
        title: "Student Created",
        message: `${req.user.name} (${req.user.role}) created student ${student.fullName}`,
        metadata: { studentId: student.id },
        businessId: student.businessId,
        branchId: student.branchId,
        actorId: req.user.id,
        isFromSystem: false,
        recipientIds: managers.map((manager) => manager.id),
      });
    }
  }

  return student;
};
