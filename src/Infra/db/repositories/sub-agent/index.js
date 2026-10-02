import {
  CreateSubAgent,
  FindSubAgentsByBranch,
  AssignSubAgentToBranch,
  FindSubAgentProfileById,
  UpdateSubAgent,
} from "./repo.js";

const SubAgentRawRepository = {
  CreateSubAgent,
  FindSubAgentsByBranch,
  AssignSubAgentToBranch,
  FindSubAgentProfileById,
  UpdateSubAgent,
};

const SubAgentRepository = new Proxy(SubAgentRawRepository, {
  get(target, methodName) {
    const originalMethod = target[methodName];

    if (typeof originalMethod !== "function") {
      return originalMethod;
    }

    return function (...args) {
      console.log(
        `[SubAgent Repository] calling "${String(methodName)}" with:`,
        args,
      );
      return originalMethod.apply(this, args);
    };
  },
});

export default SubAgentRepository;
