import StudentApplicationRepository from "../../Infra/db/repositories/student-application/index.js";
import BusinessRepository from "../../Infra/db/repositories/business/index.js";
import BranchRepository from "../../Infra/db/repositories/branch/index.js";
import StudentRepository from "../../Infra/db/repositories/student/index.js";
import { NotFoundException } from "../../shared/error.js";
import { generateApplicationId } from "../../shared/utils.js";

const MAX_APPLICATION_ID_ATTEMPTS = 5;

export const CreateStudentApplicationUseCase = async (req, payload) => {
  const {
    businessId,
    branchId,
    studentId,
    applicationStatus,
    applicationIntake,
    applicationTargetUniversity,
    applicationTutionFee,
    applicationTutionFeePeriod,
    tutionFeeCurrency,
    applicationTargetCourses,
  } = payload;

  const business = await BusinessRepository.FindBusinessById(businessId);
  if (!business) {
    throw new NotFoundException("Business not found");
  }

  const branch = await BranchRepository.FindBranchById(branchId, businessId);
  if (!branch) {
    throw new NotFoundException("Branch not found");
  }

  const student = await StudentRepository.FindStudentById(
    studentId,
    businessId,
  );
  if (!student) {
    throw new NotFoundException("Student not found");
  }

  const applicationData = {
    applicationStatus,
    applicationIntake,
    applicationTargetUniversity,
    applicationTargetCourses: applicationTargetCourses ?? [],
    applicationTutionFee,
    applicationTutionFeePeriod,
    tutionFeeCurrency: tutionFeeCurrency ?? "N/A",
    studentId,
    businessId,
    branchId,
    createdBy: req.user.id,
  };

  for (let attempt = 0; attempt < MAX_APPLICATION_ID_ATTEMPTS; attempt++) {
    try {
      return await StudentApplicationRepository.CreateStudentApplication({
        ...applicationData,
        applicationId: generateApplicationId(businessId, branchId, studentId),
      });
    } catch (error) {
      // applicationId collided with an existing one; regenerate and retry.
      const isLastAttempt = attempt === MAX_APPLICATION_ID_ATTEMPTS - 1;
      if (error.code !== "P2002" || isLastAttempt) {
        throw error;
      }
    }
  }
};
