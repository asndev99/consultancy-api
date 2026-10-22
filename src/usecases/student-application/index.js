import { CreateStudentApplicationUseCase } from "./create.student.application.usecase.js";
import { GetStudentApplicationsUseCase } from "./get.student.applications.usecase.js";
import { GetStudentApplicationsByBranchUseCase } from "./get.student.applications.by.branch.usecase.js";
import { GetManagerApplicationsByBranchUseCase } from "./get.manager.applications.by.branch.usecase.js";
import { GetCounselorApplicationsByBranchUseCase } from "./get.counselor.applications.by.branch.usecase.js";
import { GetAdmissionTeamApplicationsByBranchUseCase } from "./get.admission.team.applications.by.branch.usecase.js";
import { GetStudentApplicationDetailsUseCase } from "./get.student.application.details.usecase.js";
import { GetStudentApplicationRemarksUseCase } from "./get.student.application.remarks.usecase.js";
import { AssignStudentApplicationUseCase } from "./assign.student.application.usecase.js";
import { EditStudentApplicationUseCase } from "./edit.student.application.usecase.js";
import { UpdateStudentApplicationStatusUseCase } from "./update.student.application.status.usecase.js";
import { DeleteStudentApplicationUseCase } from "./delete.student.application.usecase.js";

const StudentApplicationUseCases = {
  CreateStudentApplicationUseCase,
  GetStudentApplicationsUseCase,
  GetStudentApplicationsByBranchUseCase,
  GetManagerApplicationsByBranchUseCase,
  GetCounselorApplicationsByBranchUseCase,
  GetAdmissionTeamApplicationsByBranchUseCase,
  GetStudentApplicationDetailsUseCase,
  GetStudentApplicationRemarksUseCase,
  AssignStudentApplicationUseCase,
  EditStudentApplicationUseCase,
  UpdateStudentApplicationStatusUseCase,
  DeleteStudentApplicationUseCase,
};

export default StudentApplicationUseCases;
