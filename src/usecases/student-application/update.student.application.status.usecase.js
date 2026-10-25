import StudentApplicationRepository from "../../Infra/db/repositories/student-application/index.js";
import { NotFoundException } from "../../shared/error.js";
import { enqueueNotification } from "../../Infra/queue/notification.queue.js";
import {
  ApplicationStatus,
  NotificationEventType,
  NotificationScreen,
} from "../../shared/application.constants.js";
import {
  resolveApplicationBranchId,
  getApplicationStakeholderIds,
} from "./application.notification.helpers.js";

export const UpdateStudentApplicationStatusUseCase = async (
  req,
  applicationId,
  applicationStatus,
) => {
  const businessId = req.user.businessId || null;

  const application =
    await StudentApplicationRepository.FindStudentApplicationById(
      Number(applicationId),
      businessId,
    );

  if (!application) {
    throw new NotFoundException("Student application not found");
  }

  const updatedApplication =
    await StudentApplicationRepository.UpdateStudentApplicationStatus(
      application.id,
      {
        applicationStatus,
        // Stamped the first time the application leaves Draft.
        ...(application.applicationSubmittedAt == null &&
        applicationStatus !== ApplicationStatus.Draft
          ? { applicationSubmittedAt: new Date() }
          : {}),
        updatedBy: req.user.id,
      },
      businessId,
    );

  const previousStatus = application.applicationStatus;
  const recipientIds = getApplicationStakeholderIds(application, req.user.id);

  // Saving the same status again isn't a change worth notifying about.
  if (previousStatus !== applicationStatus && recipientIds.length > 0) {
    const branchId = await resolveApplicationBranchId(application);

    if (branchId != null) {
      await enqueueNotification({
        eventType: NotificationEventType.ApplicationStatusChanged,
        screen: NotificationScreen.ApplicationDetails,
        title: "Application Status Updated",
        message: `${req.user.name} updated application ${application.applicationId} status from ${previousStatus} to ${applicationStatus}`,
        metadata: {
          applicationId: application.id,
          studentId: application.studentId,
          previousStatus,
          newStatus: applicationStatus,
        },
        businessId: application.businessId,
        branchId,
        actorId: req.user.id,
        isFromSystem: false,
        recipientIds,
      });
    }
  }

  return updatedApplication;
};
