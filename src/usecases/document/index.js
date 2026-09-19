import { CreateDocumentTitleUseCase } from "./create.document.title.usecase.js";
import { GetDocumentTitlesByStudentUseCase } from "./get.document.titles.by.student.usecase.js";
import { EditDocumentTitleUseCase } from "./edit.document.title.usecase.js";
import { DeleteDocumentTitleUseCase } from "./delete.document.title.usecase.js";
import { UploadStudentDocumentMediaUseCase } from "./upload.student.document.media.usecase.js";
import { ReplaceStudentDocumentMediaUseCase } from "./replace.student.document.media.usecase.js";
import { DeleteStudentDocumentMediaUseCase } from "./delete.student.document.media.usecase.js";
import { GetStudentDocumentMediaByStudentUseCase } from "./get.student.document.media.by.student.usecase.js";

const DocumentUseCases = {
  CreateDocumentTitleUseCase,
  GetDocumentTitlesByStudentUseCase,
  EditDocumentTitleUseCase,
  DeleteDocumentTitleUseCase,
  UploadStudentDocumentMediaUseCase,
  ReplaceStudentDocumentMediaUseCase,
  DeleteStudentDocumentMediaUseCase,
  GetStudentDocumentMediaByStudentUseCase,
};

export default DocumentUseCases;
