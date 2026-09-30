import {
  CreateStudentApplicationRemark,
  FindStudentApplicationRemarkById,
  UpdateStudentApplicationRemark,
  DeleteStudentApplicationRemark,
} from "./repo.js";

const StudentApplicationRemarksRawRepository = {
  CreateStudentApplicationRemark,
  FindStudentApplicationRemarkById,
  UpdateStudentApplicationRemark,
  DeleteStudentApplicationRemark,
};

const StudentApplicationRemarksRepository = new Proxy(
  StudentApplicationRemarksRawRepository,
  {
    get(target, methodName) {
      const originalMethod = target[methodName];

      if (typeof originalMethod !== "function") {
        return originalMethod;
      }

      return function (...args) {
        console.log(
          `[StudentApplicationRemarks Repository] calling "${String(methodName)}" with:`,
          args,
        );
        return originalMethod.apply(this, args);
      };
    },
  },
);

export default StudentApplicationRemarksRepository;
