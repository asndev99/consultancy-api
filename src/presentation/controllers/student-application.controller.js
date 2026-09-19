import StudentApplicationUseCases from "../../usecases/student-application/index.js";

export const createStudentApplication = async (req, res, next) => {
  try {
    const data =
      await StudentApplicationUseCases.CreateStudentApplicationUseCase(
        req,
        req.body,
      );
    res
      .status(201)
      .json({ code: 0, data, message: "Student application created" });
  } catch (error) {
    next(error);
  }
};

export const getStudentApplications = async (req, res, next) => {
  try {
    const data = await StudentApplicationUseCases.GetStudentApplicationsUseCase(
      req,
      req.params.studentId,
      req.params.branchId,
    );
    res
      .status(200)
      .json({ code: 0, data, message: "Student applications fetched" });
  } catch (error) {
    next(error);
  }
};

export const getStudentApplicationDetails = async (req, res, next) => {
  try {
    const data =
      await StudentApplicationUseCases.GetStudentApplicationDetailsUseCase(
        req,
        req.params.applicationId,
      );
    res
      .status(200)
      .json({ code: 0, data, message: "Student application fetched" });
  } catch (error) {
    next(error);
  }
};

export const getStudentApplicationRemarks = async (req, res, next) => {
  try {
    const data =
      await StudentApplicationUseCases.GetStudentApplicationRemarksUseCase(
        req,
        req.params.applicationId,
      );
    res
      .status(200)
      .json({ code: 0, data, message: "Student application remarks fetched" });
  } catch (error) {
    next(error);
  }
};

export const assignStudentApplication = async (req, res, next) => {
  try {
    const data =
      await StudentApplicationUseCases.AssignStudentApplicationUseCase(
        req,
        req.params.applicationId,
        req.body,
      );
    res
      .status(200)
      .json({ code: 0, data, message: "Student application assigned" });
  } catch (error) {
    next(error);
  }
};

export const updateStudentApplicationStatus = async (req, res, next) => {
  try {
    const data =
      await StudentApplicationUseCases.UpdateStudentApplicationStatusUseCase(
        req,
        req.params.applicationId,
        req.body.applicationStatus,
      );
    res
      .status(200)
      .json({ code: 0, data, message: "Student application status updated" });
  } catch (error) {
    next(error);
  }
};

export const deleteStudentApplication = async (req, res, next) => {
  try {
    const data =
      await StudentApplicationUseCases.DeleteStudentApplicationUseCase(
        req,
        req.params.applicationId,
      );
    res
      .status(200)
      .json({ code: 0, data, message: "Student application deleted" });
  } catch (error) {
    next(error);
  }
};
