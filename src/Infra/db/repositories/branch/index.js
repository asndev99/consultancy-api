import {
  CreateBranch,
  GetBranchesByBusinessIdIncludingUsers,
  DeleteBranch,
  UpdateBranch,
  CreateBranchManager,
  FindByBranchName
} from "./repo.js";

const BranchRawRepository = {
  GetBranchesByBusinessIdIncludingUsers,
  CreateBranch,
  DeleteBranch,
  UpdateBranch,
  CreateBranchManager,
  FindByBranchName
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

export default BranchRepository;
