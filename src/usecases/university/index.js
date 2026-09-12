import { AddUniversityCourseUseCase } from "./add.course.usecase.js";
import { EditUniversityCourseUseCase } from "./edit.university.course.usecase.js";
import { DeleteUniversityCourseUseCase } from "./delete.university.course.usecase.js";
import { AddUniversityUseCase } from "./add.university.usecase.js";
import { GetUniversitiesByBusinessId } from "./get.universities.by.businessId.usecase.js";
import { GetTargetUniversitiesUseCase } from "./get.target.universities.usecase.js";
import { EditUniversityUseCase } from "./edit.university.usecase.js";
import { GetUniversityDetailsUseCase } from "./get.university.details.usecase.js";
import { EditUniversityRequirementUseCase } from "./edit.university.requirement.usecase.js";
import { DeleteUniversityRequirementUseCase } from "./delete.university.requirement.usecase.js";
import { AddUniversityRequirementUseCase } from "./add.university.requirement.usecase.js";

const UniversityUseCases = {
  AddUniversityUseCase,
  AddUniversityCourseUseCase,
  EditUniversityCourseUseCase,
  DeleteUniversityCourseUseCase,
  GetUniversitiesByBusinessId,
  GetTargetUniversitiesUseCase,
  EditUniversityUseCase,
  GetUniversityDetailsUseCase,
  EditUniversityRequirementUseCase,
  DeleteUniversityRequirementUseCase,
  AddUniversityRequirementUseCase,
};

export default UniversityUseCases;
