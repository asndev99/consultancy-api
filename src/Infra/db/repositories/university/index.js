import {
  createUniversity,
  findUniversityById,
  findUniversityDetailsById,
  softDelete,
  update,
  createUniversityCourse,
  createUniversityRequirement,
  updateUniversityRequirement,
  softDeleteUniversityRequirement,
  CountUniversitiesByBusinessId,
  findUniversitiesByBusinessId
} from "./repo.js";

const UniversityRepositoryRaw = {
  createUniversity,
  createUniversityCourse,
  findUniversityById,
  findUniversityDetailsById,
  update,
  softDelete,
  createUniversityRequirement,
  updateUniversityRequirement,
  softDeleteUniversityRequirement,
  CountUniversitiesByBusinessId,
  findUniversitiesByBusinessId
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
