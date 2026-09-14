import {
  findUserByEmail,
  createUser,
  findUserByEmailAndBusinessIncludingBranches,
  countUsersByBusiness,
  countBusinessUsers,
  getUsersByBusinessId,
  addUserToBranch,
  DeleteUserByBusiness,
  findUserById,
  updateUserById,
  FindAssignedBranchesToUserByUserId,
  FindCounselorsByBranch,
} from "./repo.js";

const UserRepositoryRaw = {
  findUserByEmail,
  createUser,
  findUserByEmailAndBusinessIncludingBranches,
  countUsersByBusiness,
  countBusinessUsers,
  getUsersByBusinessId,
  addUserToBranch,
  DeleteUserByBusiness,
  findUserById,
  updateUserById,
  FindAssignedBranchesToUserByUserId,
  FindCounselorsByBranch,
};

const UserRepository = new Proxy(UserRepositoryRaw, {
  get(target, methodName) {
    const originalMethod = target[methodName];

    if (typeof originalMethod !== "function") {
      return originalMethod;
    }

    return function (...args) {
      console.log(
        `[UserRepository] calling "${String(methodName)}" with:`,
        args,
      );
      return originalMethod.apply(this, args);
    };
  },
});

export default UserRepository;
