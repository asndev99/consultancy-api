import { CreateHelpAndFeedback } from "./repo.js";

const HelpAndFeedbackRawRepository = {
  CreateHelpAndFeedback,
};

const HelpAndFeedbackRepository = new Proxy(HelpAndFeedbackRawRepository, {
  get(target, methodName) {
    const originalMethod = target[methodName];

    if (typeof originalMethod !== "function") {
      return originalMethod;
    }

    return function (...args) {
      console.log(
        `[HelpAndFeedback Repository] calling "${String(methodName)}" with:`,
        args,
      );
      return originalMethod.apply(this, args);
    };
  },
});

export default HelpAndFeedbackRepository;
