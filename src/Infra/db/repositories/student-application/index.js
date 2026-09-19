import {
  CreateStudentApplication,
  FindStudentApplicationsByStudentAndBranch,
  FindStudentApplicationById,
  FindStudentApplicationDetailsById,
  FindRemarksByApplicationId,
  AssignStudentApplication,
  UpdateStudentApplicationStatus,
  DeleteStudentApplication,
} from "./repo.js";

const StudentApplicationRawRepository = {
  CreateStudentApplication,
  FindStudentApplicationsByStudentAndBranch,
  FindStudentApplicationById,
  FindStudentApplicationDetailsById,
  FindRemarksByApplicationId,
  AssignStudentApplication,
  UpdateStudentApplicationStatus,
  DeleteStudentApplication,
};

const StudentApplicationRepository = new Proxy(
  StudentApplicationRawRepository,
  {
    get(target, methodName) {
      const originalMethod = target[methodName];

      if (typeof originalMethod !== "function") {
        return originalMethod;
      }

      return function (...args) {
        console.log(
          `[StudentApplication Repository] calling "${String(methodName)}" with:`,
          args,
        );
        return originalMethod.apply(this, args);
      };
    },
  },
);

export default StudentApplicationRepository;
