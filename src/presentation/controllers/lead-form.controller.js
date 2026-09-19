import LeadFormUseCases from "../../usecases/lead-form/index.js";

export const createLeadForm = async (req, res, next) => {
  try {
    const data = await LeadFormUseCases.CreateLeadFormUseCase(req, req.body);
    res.status(201).json({ code: 0, data, message: "Lead form created" });
  } catch (error) {
    next(error);
  }
};

export const getLeadForms = async (req, res, next) => {
  try {
    const data = await LeadFormUseCases.GetLeadFormsUseCase(
      req,
      req.query.branchId,
    );
    res.status(200).json({ code: 0, data, message: "Lead forms fetched" });
  } catch (error) {
    next(error);
  }
};

export const editLeadForm = async (req, res, next) => {
  try {
    const data = await LeadFormUseCases.EditLeadFormUseCase(
      req,
      req.params.leadFormId,
      req.body,
    );
    res.status(200).json({ code: 0, data, message: "Lead form updated" });
  } catch (error) {
    next(error);
  }
};

export const deleteLeadForm = async (req, res, next) => {
  try {
    const data = await LeadFormUseCases.DeleteLeadFormUseCase(
      req,
      req.params.leadFormId,
    );
    res.status(200).json({ code: 0, data, message: "Lead form deleted" });
  } catch (error) {
    next(error);
  }
};

export const getPublicLeadForm = async (req, res, next) => {
  try {
    const data = await LeadFormUseCases.GetPublicLeadFormUseCase(
      req.params.publicId,
    );
    res.status(200).json({ code: 0, data, message: "Lead form fetched" });
  } catch (error) {
    next(error);
  }
};
