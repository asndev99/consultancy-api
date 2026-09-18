import {
  CreateStudent,
  FindStudentByBusinessBranchEmailPhone,
  CountStudentsByBusinessBranch,
  FindStudentsByBusinessBranch,
  FindStudentById,
  UpdateStudent,
  FindActiveStudentsByIds,
  BulkUpdateStudentCounselor,
  FindTargetUniversitiesByStudentId,
  FindTargetUniversityWithCoursesById,
  FindTargetUniversitiesByStudentAndUniversityIds,
  CreateTargetUniversities,
  FindTargetUniversityById,
  CreateTargetCourses,
  FindTargetCourseById,
  DeleteTargetUniversity,
  DeleteTargetCourse,
} from "./repo.js";

const StudentRawRepository = {
  CreateStudent,
  FindStudentByBusinessBranchEmailPhone,
  CountStudentsByBusinessBranch,
  FindStudentsByBusinessBranch,
  FindStudentById,
  UpdateStudent,
  FindActiveStudentsByIds,
  BulkUpdateStudentCounselor,
  FindTargetUniversitiesByStudentId,
  FindTargetUniversityWithCoursesById,
  FindTargetUniversitiesByStudentAndUniversityIds,
  CreateTargetUniversities,
  FindTargetUniversityById,
  CreateTargetCourses,
  FindTargetCourseById,
  DeleteTargetUniversity,
  DeleteTargetCourse,
};

const StudentRepository = new Proxy(StudentRawRepository, {
  get(target, methodName) {
    const originalMethod = target[methodName];

    if (typeof originalMethod !== "function") {
      return originalMethod;
    }

    return function (...args) {
      console.log(
        `[Student Repository] calling "${String(methodName)}" with:`,
        args,
      );
      return originalMethod.apply(this, args);
    };
  },
});

export default StudentRepository;
