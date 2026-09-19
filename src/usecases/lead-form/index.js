import { CreateLeadFormUseCase } from "./create.lead.form.usecase.js";
import { GetLeadFormsUseCase } from "./get.lead.forms.usecase.js";
import { EditLeadFormUseCase } from "./edit.lead.form.usecase.js";
import { DeleteLeadFormUseCase } from "./delete.lead.form.usecase.js";
import { GetPublicLeadFormUseCase } from "./get.public.lead.form.usecase.js";

const LeadFormUseCases = {
  CreateLeadFormUseCase,
  GetLeadFormsUseCase,
  EditLeadFormUseCase,
  DeleteLeadFormUseCase,
  GetPublicLeadFormUseCase,
};

export default LeadFormUseCases;
