import {
  CountNewLeads,
  CountSubmittedApplications,
  CountApplicationsByStatus,
  CountEnrolledStudents,
  GroupStudentsByTargetCountry,
  CountStudentsWithTargetCountry,
  GroupStudentsByLeadStage,
  GroupApplicationsByIntake,
  FindBusinessTimeZone,
  GroupLeadsBySource,
} from "./repo.js";

const DashboardRawRepository = {
  CountNewLeads,
  CountSubmittedApplications,
  CountApplicationsByStatus,
  CountEnrolledStudents,
  GroupStudentsByTargetCountry,
  CountStudentsWithTargetCountry,
  GroupStudentsByLeadStage,
  GroupApplicationsByIntake,
  FindBusinessTimeZone,
  GroupLeadsBySource,
};

const DashboardRepository = new Proxy(DashboardRawRepository, {
  get(target, methodName) {
    const originalMethod = target[methodName];

    if (typeof originalMethod !== "function") {
      return originalMethod;
    }

    return function (...args) {
      console.log(
        `[Dashboard Repository] calling "${String(methodName)}" with:`,
        args,
      );
      return originalMethod.apply(this, args);
    };
  },
});

export default DashboardRepository;
