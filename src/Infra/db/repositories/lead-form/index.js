import {
  CreateLeadForm,
  FindLeadFormById,
  FindLeadForms,
  UpdateLeadForm,
  DeleteLeadForm,
  FindLeadFormSubmissionsByFormId,
  FindPublicLeadFormByPublicId,
} from "./repo.js";

const LeadFormRawRepository = {
  CreateLeadForm,
  FindLeadFormById,
  FindLeadForms,
  UpdateLeadForm,
  DeleteLeadForm,
  FindLeadFormSubmissionsByFormId,
  FindPublicLeadFormByPublicId,
};

const LeadFormRepository = new Proxy(LeadFormRawRepository, {
  get(target, methodName) {
    const originalMethod = target[methodName];

    if (typeof originalMethod !== "function") {
      return originalMethod;
    }

    return function (...args) {
      console.log(
        `[LeadForm Repository] calling "${String(methodName)}" with:`,
        args,
      );
      return originalMethod.apply(this, args);
    };
  },
});

export default LeadFormRepository;
