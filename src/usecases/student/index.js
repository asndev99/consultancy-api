import { CreateStudentUseCase } from "./create.student.usecase.js";
import { EditStudentUseCase } from "./edit.student.usecase.js";
import { AssignStudentCounselorUseCase } from "./assign.student.counselor.usecase.js";
import { GetStudentsByBranchUseCase } from "./get.students.by.branch.usecase.js";
import { GetStudentStatsByBranchUseCase } from "./get.student.stats.by.branch.usecase.js";
import { GetStudentByIdUseCase } from "./get.student.by.id.usecase.js";
import { GetTargetUniversitiesUseCase } from "./get.target.universities.usecase.js";
import { UpdateTargetUniversitiesUseCase } from "./update.target.universities.usecase.js";
import { AddTargetUniversityCoursesUseCase } from "./add.target.university.courses.usecase.js";
import { DeleteTargetUniversityUseCase } from "./delete.target.university.usecase.js";
import { DeleteTargetUniversityCourseUseCase } from "./delete.target.university.course.usecase.js";

const StudentUseCases = {
  CreateStudentUseCase,
  EditStudentUseCase,
  AssignStudentCounselorUseCase,
  GetStudentsByBranchUseCase,
  GetStudentStatsByBranchUseCase,
  GetStudentByIdUseCase,
  GetTargetUniversitiesUseCase,
  UpdateTargetUniversitiesUseCase,
  AddTargetUniversityCoursesUseCase,
  DeleteTargetUniversityUseCase,
  DeleteTargetUniversityCourseUseCase,
};

export default StudentUseCases;
