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

export const getStudentApplicationsByBranch = async (req, res, next) => {
  try {
    const { page, limit, managerId, admissionOfficerId } = req.query;
    const { data, pagination } =
      await StudentApplicationUseCases.GetStudentApplicationsByBranchUseCase(
        req,
        req.params.branchId,
        {
          page: page ? Number(page) : undefined,
          limit: limit ? Number(limit) : undefined,
        },
        { managerId, admissionOfficerId },
      );
    res.status(200).json({
      code: 0,
      data,
      pagination,
      message: "Student applications fetched",
    });
  } catch (error) {
    next(error);
  }
};

export const getManagerApplicationsByBranch = async (req, res, next) => {
  try {
    const {
      page,
      limit,
      managerId,
      counselorId,
      admissionOfficerId,
      subAgentId,
      status,
      searchTerm,
    } = req.query;
    const { data, pagination } =
      await StudentApplicationUseCases.GetManagerApplicationsByBranchUseCase(
        req,
        req.params.branchId,
        {
          page: page ? Number(page) : undefined,
          limit: limit ? Number(limit) : undefined,
        },
        {
          managerId,
          counselorId,
          admissionOfficerId,
          subAgentId,
          status,
          searchTerm,
        },
      );
    res.status(200).json({
      code: 0,
      data,
      pagination,
      message: "Student applications fetched",
    });
  } catch (error) {
    next(error);
  }
};

export const getCounselorApplicationsByBranch = async (req, res, next) => {
  try {
    const { page, limit, status, managerId, admissionOfficerId, searchTerm } =
      req.query;
    const { data, pagination } =
      await StudentApplicationUseCases.GetCounselorApplicationsByBranchUseCase(
        req,
        req.params.branchId,
        {
          page: page ? Number(page) : undefined,
          limit: limit ? Number(limit) : undefined,
        },
        { status, managerId, admissionOfficerId, searchTerm },
      );
    res.status(200).json({
      code: 0,
      data,
      pagination,
      message: "Student applications fetched",
    });
  } catch (error) {
    next(error);
  }
};

export const getSubAgentApplicationsByBranch = async (req, res, next) => {
  try {
    const { page, limit, status, managerId, admissionOfficerId, searchTerm } =
      req.query;
    const { data, pagination } =
      await StudentApplicationUseCases.GetSubAgentApplicationsByBranchUseCase(
        req,
        req.params.branchId,
        {
          page: page ? Number(page) : undefined,
          limit: limit ? Number(limit) : undefined,
        },
        { status, managerId, admissionOfficerId, searchTerm },
      );
    res.status(200).json({
      code: 0,
      data,
      pagination,
      message: "Student applications fetched",
    });
  } catch (error) {
    next(error);
  }
};

export const getAdmissionTeamApplicationsByBranch = async (req, res, next) => {
  try {
    const { page, limit, status } = req.query;
    const { data, pagination } =
      await StudentApplicationUseCases.GetAdmissionTeamApplicationsByBranchUseCase(
        req,
        req.params.branchId,
        {
          page: page ? Number(page) : undefined,
          limit: limit ? Number(limit) : undefined,
        },
        { status },
      );
    res.status(200).json({
      code: 0,
      data,
      pagination,
      message: "Student applications fetched",
    });
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

export const editStudentApplication = async (req, res, next) => {
  try {
    const data = await StudentApplicationUseCases.EditStudentApplicationUseCase(
      req,
      req.params.applicationId,
      req.body,
    );
    res
      .status(200)
      .json({ code: 0, data, message: "Student application updated" });
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
