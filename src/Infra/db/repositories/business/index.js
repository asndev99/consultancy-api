import { GetManagersByBusiness, getUsersByBusinessId } from "../user/repo.js";
import {
  findBusinessByName,
  RegisterBusiness,
  FindBusinessById,
} from "./repo.js";

const BusinessRepositoryRaw = {
  findBusinessByName,
  RegisterBusiness,
  GetManagersByBusiness,
  FindBusinessById,
  getUsersByBusinessId,
};

const BusinessRepository = new Proxy(BusinessRepositoryRaw, {
  get(target, methodName) {
    const originalMethod = target[methodName];

    if (typeof originalMethod !== "function") {
      return originalMethod;
    }

    return function (...args) {
      console.log(
        `[Business Repository] calling "${String(methodName)}" with:`,
        args,
      );
      return originalMethod.apply(this, args);
    };
  },
});

export default BusinessRepository;
