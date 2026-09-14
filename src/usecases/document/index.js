import { CreateDocumentTitleUseCase } from "./create.document.title.usecase.js";
import { GetDocumentTitlesByStudentUseCase } from "./get.document.titles.by.student.usecase.js";
import { EditDocumentTitleUseCase } from "./edit.document.title.usecase.js";
import { DeleteDocumentTitleUseCase } from "./delete.document.title.usecase.js";

const DocumentUseCases = {
  CreateDocumentTitleUseCase,
  GetDocumentTitlesByStudentUseCase,
  EditDocumentTitleUseCase,
  DeleteDocumentTitleUseCase,
};

export default DocumentUseCases;
