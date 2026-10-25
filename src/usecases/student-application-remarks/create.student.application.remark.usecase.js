import StudentApplicationRepository from "../../Infra/db/repositories/student-application/index.js";
import StudentApplicationRemarksRepository from "../../Infra/db/repositories/student-application-remarks/index.js";
import { enqueueNotification } from "../../Infra/queue/notification.queue.js";
import {
  NotificationEventType,
  NotificationScreen,
} from "../../shared/application.constants.js";
import {
  resolveApplicationBranchId,
  getApplicationStakeholderIds,
} from "../student-application/application.notification.helpers.js";
import { NotFoundException } from "../../shared/error.js";

export const CreateStudentApplicationRemarkUseCase = async (
  req,
  applicationId,
  comment,
) => {
  const application =
    await StudentApplicationRepository.FindStudentApplicationById(
      Number(applicationId),
      req.user.businessId || null,
    );

  if (!application) {
    throw new NotFoundException("Student application not found");
  }

  const remark =
    await StudentApplicationRemarksRepository.CreateStudentApplicationRemark({
      applicationId: application.id,
      comment,
      authorId: req.user.id,
    });

  const recipientIds = getApplicationStakeholderIds(application, req.user.id);

  if (recipientIds.length > 0) {
    const branchId = await resolveApplicationBranchId(application);

    if (branchId != null) {
      await enqueueNotification({
        eventType: NotificationEventType.ApplicationRemarkAdded,
        screen: NotificationScreen.ApplicationRemarks,
        title: "Comment Added",
        message: `${req.user.name} added a comment on application ${application.applicationId}`,
        metadata: {
          applicationId: application.id,
          studentId: application.studentId,
          remarkId: remark.id,
        },
        businessId: application.businessId,
        branchId,
        actorId: req.user.id,
        isFromSystem: false,
        recipientIds,
      });
    }
  }

  return remark;
};
