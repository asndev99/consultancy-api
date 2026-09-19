import {
  createUniversity,
  findUniversityById,
  findUniversityDetailsById,
  softDelete,
  update,
  createUniversityCourse,
  updateUniversityCourse,
  softDeleteUniversityCourse,
  findUniversityCourseById,
  createUniversityRequirement,
  updateUniversityRequirement,
  softDeleteUniversityRequirement,
  CountUniversitiesByBusinessId,
  findUniversitiesByBusinessId,
  findUniversityByBusinessId,
  findTargetUniversitiesByBusinessId,
  findUniversityCoursesByUniversityId,
} from "./repo.js";

const UniversityRepositoryRaw = {
  createUniversity,
  createUniversityCourse,
  updateUniversityCourse,
  softDeleteUniversityCourse,
  findUniversityCourseById,
  findUniversityById,
  findUniversityDetailsById,
  update,
  softDelete,
  createUniversityRequirement,
  updateUniversityRequirement,
  softDeleteUniversityRequirement,
  CountUniversitiesByBusinessId,
  findUniversitiesByBusinessId,
  findUniversityByBusinessId,
  findTargetUniversitiesByBusinessId,
  findUniversityCoursesByUniversityId,
};

const UniversityRepository = new Proxy(UniversityRepositoryRaw, {
  get(target, methodName) {
    const originalMethod = target[methodName];

    if (typeof originalMethod !== "function") {
      return originalMethod;
    }

    return function (...args) {
      console.log(
        `[UniversityRepository] calling "${String(methodName)}" with:`,
        args,
      );
      return originalMethod.apply(this, args);
    };
  },
});

export default UniversityRepository;
