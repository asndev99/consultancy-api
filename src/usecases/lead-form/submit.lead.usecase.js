import LeadFormRepository from "../../Infra/db/repositories/lead-form/index.js";
import { CreateStudentUseCase } from "../student/create.student.usecase.js";
import { LeadFormType } from "../../shared/application.constants.js";
import { NotFoundException } from "../../shared/error.js";

// Public submission: every lead is recorded in LeadSubmissions. For
// BRANCH_LEVEL forms we also try to create the Student straight away; any
// failure there is stored on the submission and never surfaced to the
// submitter, since their data is already recorded.
export const SubmitLeadUseCase = async (publicId, payload) => {
  const leadForm =
    await LeadFormRepository.FindActiveLeadFormByPublicId(publicId);

  if (!leadForm) {
    throw new NotFoundException("Lead form not found");
  }

  const submission = await LeadFormRepository.CreateLeadSubmission({
    formId: leadForm.id,
    fullName: payload.fullName,
    email: payload.email,
    phoneNo: payload.phoneNo,
    preferredTargetCountries: payload.preferredTargetCountries ?? [],
    targetDegreeLevel: payload.targetDegreeLevel ?? null,
    additionalNotes: payload.additionalNotes ?? null,
    leadSource: leadForm.utmSource ?? null,
  });

  if (leadForm.type === LeadFormType.BRANCH_LEVEL) {
    await syncSubmissionToStudent(leadForm, submission);
  }

  return { submitted: true };
};

async function syncSubmissionToStudent(leadForm, submission) {
  try {
    if (leadForm.branchId == null) {
      throw new Error("Branch level lead form has no branchId");
    }

    // No authenticated user on a public submission; 0 marks a system-created
    // student for now.
    await CreateStudentUseCase(
      { user: { id: 0 } },
      {
        fullName: submission.fullName,
        email: submission.email,
        phoneNo: submission.phoneNo,
        businessId: leadForm.businessId,
        branchId: leadForm.branchId,
        preferredTargetCountries: submission.preferredTargetCountries,
        targetDegree:
          submission.targetDegreeLevel ?? leadForm.targetDegreeLevel,
        leadSource: submission.leadSource,
        isFromLeadForm: true,
        leadFormId: leadForm.id,
      },
    );

    await LeadFormRepository.UpdateLeadSubmission(submission.id, {
      syncStatus: true,
      failedReason: null,
    });
  } catch (error) {
    console.error(
      `[SubmitLeadUseCase] failed to sync submission ${submission.id} to student:`,
      error,
    );
    try {
      await LeadFormRepository.UpdateLeadSubmission(submission.id, {
        syncStatus: false,
        failedReason: String(error?.message ?? error).slice(0, 1000),
      });
    } catch (updateError) {
      console.error(
        `[SubmitLeadUseCase] failed to record failedReason for submission ${submission.id}:`,
        updateError,
      );
    }
  }
}
