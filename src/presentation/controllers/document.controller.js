import DocumentUseCases from "../../usecases/document/index.js";

export const createDocumentTitle = async (req, res, next) => {
  try {
    const data = await DocumentUseCases.CreateDocumentTitleUseCase(
      req,
      req.body,
    );
    res.status(201).json({ code: 0, data, message: "Document title created" });
  } catch (error) {
    next(error);
  }
};

export const getDocumentTitlesByStudent = async (req, res, next) => {
  try {
    const data = await DocumentUseCases.GetDocumentTitlesByStudentUseCase(
      req,
      req.params.studentId,
    );
    res
      .status(200)
      .json({ code: 0, data, message: "Document titles fetched" });
  } catch (error) {
    next(error);
  }
};

export const editDocumentTitle = async (req, res, next) => {
  try {
    const data = await DocumentUseCases.EditDocumentTitleUseCase(
      req,
      req.params.documentTitleId,
      req.body,
    );
    res.status(200).json({ code: 0, data, message: "Document title updated" });
  } catch (error) {
    next(error);
  }
};

export const deleteDocumentTitle = async (req, res, next) => {
  try {
    const data = await DocumentUseCases.DeleteDocumentTitleUseCase(
      req,
      req.params.documentTitleId,
    );
    res.status(200).json({ code: 0, data, message: "Document title deleted" });
  } catch (error) {
    next(error);
  }
};

export const uploadStudentDocumentMedia = async (req, res, next) => {
  try {
    const data = await DocumentUseCases.UploadStudentDocumentMediaUseCase(
      req,
      req.body,
      req.files,
    );
    res
      .status(201)
      .json({ code: 0, data, message: "Document media uploaded" });
  } catch (error) {
    next(error);
  }
};

export const replaceStudentDocumentMedia = async (req, res, next) => {
  try {
    const data = await DocumentUseCases.ReplaceStudentDocumentMediaUseCase(
      req,
      req.params.mediaId,
      req.file,
    );
    res
      .status(200)
      .json({ code: 0, data, message: "Document media replaced" });
  } catch (error) {
    next(error);
  }
};

export const deleteStudentDocumentMedia = async (req, res, next) => {
  try {
    const data = await DocumentUseCases.DeleteStudentDocumentMediaUseCase(
      req,
      req.params.mediaId,
    );
    res.status(200).json({ code: 0, data, message: "Document media deleted" });
  } catch (error) {
    next(error);
  }
};

export const getStudentDocumentMediaByStudent = async (req, res, next) => {
  try {
    const data =
      await DocumentUseCases.GetStudentDocumentMediaByStudentUseCase(
        req,
        req.params.studentId,
      );
    res.status(200).json({ code: 0, data, message: "Document media fetched" });
  } catch (error) {
    next(error);
  }
};
