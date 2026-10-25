import StudentApplicationRepository from "../../Infra/db/repositories/student-application/index.js";
import UserRepository from "../../Infra/db/repositories/user/index.js";
import { enqueueNotification } from "../../Infra/queue/notification.queue.js";
import {
  UserRoles,
  NotificationEventType,
  NotificationScreen,
} from "../../shared/application.constants.js";
import { resolveApplicationBranchId } from "./application.notification.helpers.js";
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

  const application =
    await StudentApplicationRepository.FindStudentApplicationById(
      Number(applicationId),
      businessId,
    );
  if (!application) {
    throw new NotFoundException("Student application not found");
  }

  const assignedAt = new Date();
  const updateData = { updatedBy: req.user.id };
  const newlyAssigned = [];

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

    const previousUserId =
      role === UserRoles.Manager
        ? application.managerId
        : application.admissionOfficerId;
    if (previousUserId !== user.id && user.id !== req.user.id) {
      newlyAssigned.push({ role, userId: user.id });
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

  const updatedApplication =
    await StudentApplicationRepository.AssignStudentApplication(
      application.id,
      updateData,
      businessId,
    );

  // Re-assigning the same user or assigning yourself sends nothing.
  if (newlyAssigned.length > 0) {
    const branchId = await resolveApplicationBranchId(application);

    if (branchId != null) {
      await Promise.all(
        newlyAssigned.map(({ role, userId }) =>
          enqueueNotification({
            eventType:
              role === UserRoles.Manager
                ? NotificationEventType.ApplicationManagerAssigned
                : NotificationEventType.ApplicationAdmissionOfficerAssigned,
            screen: NotificationScreen.ApplicationDetails,
            title: "Application Assigned",
            message: `${req.user.name} assigned you application ${application.applicationId} as ${role}`,
            metadata: {
              applicationId: application.id,
              studentId: application.studentId,
            },
            businessId: application.businessId,
            branchId,
            actorId: req.user.id,
            isFromSystem: false,
            recipientIds: [userId],
          }),
        ),
      );
    }
  }

  return updatedApplication;
};
