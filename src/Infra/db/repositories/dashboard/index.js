import {
  CountBranches,
  CountStudents,
  CountSubAgents,
  GroupApplicationsByStatus,
  ListBranches,
  GroupStudentsByBranch,
  GroupSubAgentsByBranch,
  GroupApplicationsByBranchAndStatus,
  GroupStudentsByLeadStage,
  GroupStudentsByLeadSource,
  GroupApplicationsByTargetCountry,
  ListSubAgents,
  GroupStudentsByCreator,
  GroupApplicationsByCreatorAndStatus,
  FindBusinessTimeZone,
  CountNewStudentsByPeriod,
  CountNewApplicationsByPeriod,
  CountEnrolledApplicationsByPeriod,
} from "./repo.js";

const DashboardRawRepository = {
  CountBranches,
  CountStudents,
  CountSubAgents,
  GroupApplicationsByStatus,
  ListBranches,
  GroupStudentsByBranch,
  GroupSubAgentsByBranch,
  GroupApplicationsByBranchAndStatus,
  GroupStudentsByLeadStage,
  GroupStudentsByLeadSource,
  GroupApplicationsByTargetCountry,
  ListSubAgents,
  GroupStudentsByCreator,
  GroupApplicationsByCreatorAndStatus,
  FindBusinessTimeZone,
  CountNewStudentsByPeriod,
  CountNewApplicationsByPeriod,
  CountEnrolledApplicationsByPeriod,
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
