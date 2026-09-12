import { CreateStudentUseCase } from "./create.student.usecase.js";
import { GetStudentsByBranchUseCase } from "./get.students.by.branch.usecase.js";
import { GetTargetUniversitiesUseCase } from "./get.target.universities.usecase.js";
import { AddTargetUniversitiesUseCase } from "./add.target.universities.usecase.js";
import { AddTargetUniversityCoursesUseCase } from "./add.target.university.courses.usecase.js";
import { DeleteTargetUniversityUseCase } from "./delete.target.university.usecase.js";
import { DeleteTargetUniversityCourseUseCase } from "./delete.target.university.course.usecase.js";

const StudentUseCases = {
  CreateStudentUseCase,
  GetStudentsByBranchUseCase,
  GetTargetUniversitiesUseCase,
  AddTargetUniversitiesUseCase,
  AddTargetUniversityCoursesUseCase,
  DeleteTargetUniversityUseCase,
  DeleteTargetUniversityCourseUseCase,
};

export default StudentUseCases;
