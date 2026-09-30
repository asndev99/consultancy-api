import StudentApplicationRemarksUseCases from "../../usecases/student-application-remarks/index.js";

export const createStudentApplicationRemark = async (req, res, next) => {
  try {
    const data =
      await StudentApplicationRemarksUseCases.CreateStudentApplicationRemarkUseCase(
        req,
        req.body.applicationId,
        req.body.comment,
      );
    res.status(201).json({ code: 0, data, message: "Remark created" });
  } catch (error) {
    next(error);
  }
};

export const updateStudentApplicationRemark = async (req, res, next) => {
  try {
    const data =
      await StudentApplicationRemarksUseCases.UpdateStudentApplicationRemarkUseCase(
        req,
        req.params.remarkId,
        req.body.comment,
      );
    res.status(200).json({ code: 0, data, message: "Remark updated" });
  } catch (error) {
    next(error);
  }
};

export const deleteStudentApplicationRemark = async (req, res, next) => {
  try {
    const data =
      await StudentApplicationRemarksUseCases.DeleteStudentApplicationRemarkUseCase(
        req,
        req.params.remarkId,
      );
    res.status(200).json({ code: 0, data, message: "Remark deleted" });
  } catch (error) {
    next(error);
  }
};
