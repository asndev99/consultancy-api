import StudentUseCases from "../../usecases/student/index.js";

export const createStudent = async (req, res, next) => {
  try {
    const data = await StudentUseCases.CreateStudentUseCase(req, req.body);
    res.status(201).json({ code: 0, data, message: "Student created" });
  } catch (error) {
    next(error);
  }
};

export const editStudent = async (req, res, next) => {
  try {
    const data = await StudentUseCases.EditStudentUseCase(
      req,
      req.params.studentId,
      req.body,
    );
    res.status(200).json({ code: 0, data, message: "Student updated" });
  } catch (error) {
    next(error);
  }
};

export const assignStudentCounselor = async (req, res, next) => {
  try {
    const data = await StudentUseCases.AssignStudentCounselorUseCase(
      req,
      req.body,
    );
    res
      .status(200)
      .json({ code: 0, data, message: "Student counselor assigned" });
  } catch (error) {
    next(error);
  }
};

export const getStudentById = async (req, res, next) => {
  try {
    const data = await StudentUseCases.GetStudentByIdUseCase(
      req,
      req.params.studentId,
      req.params.branchId,
    );
    res.status(200).json({ code: 0, data, message: "Student fetched" });
  } catch (error) {
    next(error);
  }
};

export const getStudentsByBranch = async (req, res, next) => {
  try {
    const { page, pageSize, counselorId, leadStage, searchTerm } = req.query;
    const { data, pagination } =
      await StudentUseCases.GetStudentsByBranchUseCase({
        businessId: req.user.businessId,
        branchId: req.params.branchId,
        page: page ? Number(page) : undefined,
        pageSize: pageSize ? Number(pageSize) : undefined,
        counselorId: counselorId || undefined,
        leadStage: leadStage || undefined,
        searchTerm: searchTerm || undefined,
      });
    res
      .status(200)
      .json({ code: 0, data, pagination, message: "Students fetched" });
  } catch (error) {
    next(error);
  }
};

export const getTargetUniversities = async (req, res, next) => {
  try {
    const data = await StudentUseCases.GetTargetUniversitiesUseCase(
      req,
      req.params.studentId,
    );
    res
      .status(200)
      .json({ code: 0, data, message: "Target universities fetched" });
  } catch (error) {
    next(error);
  }
};

export const updateTargetUniversities = async (req, res, next) => {
  try {
    const data = await StudentUseCases.UpdateTargetUniversitiesUseCase(
      req,
      req.params.studentId,
      req.body,
    );
    res
      .status(200)
      .json({ code: 0, data, message: "Target universities updated" });
  } catch (error) {
    next(error);
  }
};

export const addTargetUniversityCourses = async (req, res, next) => {
  try {
    const data = await StudentUseCases.AddTargetUniversityCoursesUseCase(
      req,
      req.params.studentId,
      req.params.targetUniversityId,
      req.body.courseIds,
    );
    res
      .status(201)
      .json({ code: 0, data, message: "Target university courses added" });
  } catch (error) {
    next(error);
  }
};

export const deleteTargetUniversity = async (req, res, next) => {
  try {
    const data = await StudentUseCases.DeleteTargetUniversityUseCase(
      req,
      req.params.studentId,
      req.params.targetUniversityId,
    );
    res
      .status(200)
      .json({ code: 0, data, message: "Target university deleted" });
  } catch (error) {
    next(error);
  }
};

export const deleteTargetUniversityCourse = async (req, res, next) => {
  try {
    const data = await StudentUseCases.DeleteTargetUniversityCourseUseCase(
      req,
      req.params.studentId,
      req.params.targetUniversityId,
      req.params.targetCourseId,
    );
    res
      .status(200)
      .json({ code: 0, data, message: "Target university course deleted" });
  } catch (error) {
    next(error);
  }
};
