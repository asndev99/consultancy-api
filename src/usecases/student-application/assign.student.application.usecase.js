import StudentApplicationRepository from "../../Infra/db/repositories/student-application/index.js";
import UserRepository from "../../Infra/db/repositories/user/index.js";
import { UserRoles } from "../../shared/application.constants.js";
import { BadRequestException, NotFoundException } from "../../shared/error.js";

export const AssignStudentApplicationUseCase = async (
  req,
  applicationId,
  assignments,
) => {
  const businessId = req.user.businessId || null;

  const roles = assignments.map((assignment) => assignment.role);
  if (new Set(roles).size !== roles.length) {
    throw new BadRequestException("Each role can only be assigned once");
  }

  const application = await StudentApplicationRepository.FindStudentApplicationById(
    Number(applicationId),
    businessId,
  );
  if (!application) {
    throw new NotFoundException("Student application not found");
  }

  const assignedAt = new Date();
  const updateData = { updatedBy: req.user.id };

  for (const { role, userId } of assignments) {
    const user = await UserRepository.findUserById(Number(userId));
    if (!user || user.isDeleted) {
      throw new NotFoundException(`User ${userId} not found`);
    }

    if (user.role !== role) {
      throw new BadRequestException(`User ${userId} is not a ${role}`);
    }

    if (businessId != null && user.businessId !== businessId) {
      throw new BadRequestException(
        `User ${userId} does not belong to this business`,
      );
    }

    if (role === UserRoles.Manager) {
      updateData.managerId = user.id;
      updateData.isManagerAssigned = true;
      updateData.managerAssignedAt = assignedAt;
    } else {
      updateData.admissionOfficerId = user.id;
      updateData.isAdmissionTeamAssigned = true;
      updateData.admissionTeamAssignedAt = assignedAt;
    }
  }

  return StudentApplicationRepository.AssignStudentApplication(
    application.id,
    updateData,
    businessId,
  );
};
