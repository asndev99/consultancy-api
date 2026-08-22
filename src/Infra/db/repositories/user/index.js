import {
  findUserByEmail,
  createUser,
  findUserByEmailAndBusinessIncludingBranches,
  countUsersByBusiness,
  getUsersByBusinessId,
  addUserToBranch

} from "./repo.js";

const UserRepositoryRaw = {
  findUserByEmail,
  createUser,
  findUserByEmailAndBusinessIncludingBranches,
  countUsersByBusiness,
  getUsersByBusinessId,
  addUserToBranch
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
