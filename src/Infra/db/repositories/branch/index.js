import {
  CreateBranch,
  GetBranchesByBusinessIdIncludingUsers,
  DeleteBranch,
  UpdateBranch,
} from "./repo";

const BranchRawRepository = {
  GetBranchesByBusinessIdIncludingUsers,
  CreateBranch,
  DeleteBranch,
  UpdateBranch,
};

const BranchRepository = new Proxy(BranchRawRepository, {
  get(target, methodName) {
    const originalMethod = target[methodName];

    if (typeof originalMethod !== "function") {
      return originalMethod;
    }

    return function (...args) {
      console.log(
        `[Branch Repository] calling "${String(methodName)}" with:`,
        args,
      );
      return originalMethod.apply(this, args);
    };
  },
});

export default BranchRepository
