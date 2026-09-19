import {
  CreateDocumentTitle,
  FindDocumentTitlesByStudentId,
  FindDocumentTitleById,
  UpdateDocumentTitle,
  DeleteDocumentTitle,
  CreateStudentDocumentMedia,
  FindStudentDocumentMediaById,
  FindStudentDocumentMediaByStudentId,
  UpdateStudentDocumentMedia,
  DeleteStudentDocumentMedia,
} from "./repo.js";

const DocumentRawRepository = {
  CreateDocumentTitle,
  FindDocumentTitlesByStudentId,
  FindDocumentTitleById,
  UpdateDocumentTitle,
  DeleteDocumentTitle,
  CreateStudentDocumentMedia,
  FindStudentDocumentMediaById,
  FindStudentDocumentMediaByStudentId,
  UpdateStudentDocumentMedia,
  DeleteStudentDocumentMedia,
};

const DocumentRepository = new Proxy(DocumentRawRepository, {
  get(target, methodName) {
    const originalMethod = target[methodName];

    if (typeof originalMethod !== "function") {
      return originalMethod;
    }

    return function (...args) {
      console.log(
        `[Document Repository] calling "${String(methodName)}" with:`,
        args,
      );
      return originalMethod.apply(this, args);
    };
  },
});

export default DocumentRepository;
