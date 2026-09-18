import StudentApplicationRepository from "../../Infra/db/repositories/student-application/index.js";
import UserRepository from "../../Infra/db/repositories/user/index.js";
import { UserRoles } from "../../shared/application.constants.js";
import { BadRequestException, NotFoundException } from "../../shared/error.js";

export const AssignStudentApplicationUseCase = async (
  req,
  applicationId,
  payload,
) => {
  const { role, userId } = payload;
  const businessId = req.user.businessId || null;

  const application = await StudentApplicationRepository.FindStudentApplicationById(
    Number(applicationId),
    businessId,
  );
  if (!application) {
    throw new NotFoundException("Student application not found");
  }

  const user = await UserRepository.findUserById(Number(userId));
  if (!user || user.isDeleted) {
    throw new NotFoundException("User not found");
  }

  if (user.role !== role) {
    throw new BadRequestException(`User is not a ${role}`);
  }

  if (businessId != null && user.businessId !== businessId) {
    throw new BadRequestException("User does not belong to this business");
  }

  const assignedAt = new Date();
  const updateData =
    role === UserRoles.Manager
      ? {
          managerId: user.id,
          isManagerAssigned: true,
          managerAssignedAt: assignedAt,
          updatedBy: req.user.id,
        }
      : {
          admissionOfficerId: user.id,
          isAdmissionTeamAssigned: true,
          admissionTeamAssignedAt: assignedAt,
          updatedBy: req.user.id,
        };

  return StudentApplicationRepository.AssignStudentApplication(
    application.id,
    updateData,
    businessId,
  );
};
