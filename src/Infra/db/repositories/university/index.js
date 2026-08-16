import {
  createUniversity,
  findUniversityById,
  softDelete,
  update,
  createUniversityCourse,
  createUniversityRequirement,
} from "./repo.js";

const UniversityRepositoryRaw = {
  createUniversity,
  createUniversityCourse,
  findUniversityById,
  update,
  softDelete,
  createUniversityRequirement,
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
