import {
  findActiveUserByEmailAndBusinessId,
  findUserByEmail,
  createUser,
} from "./repo.js";

const UserRepositoryRaw = {
  findActiveUserByEmailAndBusinessId,
  findUserByEmail,
  createUser,
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
