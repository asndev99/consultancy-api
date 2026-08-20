import UniversityUseCases from "../../usecases/university/index.js";

export const addUniversityForBusiness = async (req, res, next) => {
  try {
    const data = await UniversityUseCases.AddUniversityUseCase(
      req.user.id,
      req.body,
    );
    res.status(201).json({ code: 1, data, message: "University created" });
  } catch (error) {
    next(error);
  }
};

export const GetUniveristyByBusiness = async (req, res, next) => {
  try {
    const { page, pageSize } = req.query;
    const data = await UniversityUseCases.GetUniversitiesByBusinessId(
      req.params.businessId,
      page ? Number(page) : undefined,
      pageSize ? Number(pageSize) : undefined,
    );
    res.status(200).json({ code: 1, data, message: "Universities fetched" });
  } catch (error) {
    next(error);
  }
};

export const getUniversityDetails = async (req, res, next) => {
  try {
    const data = await UniversityUseCases.GetUniversityDetailsUseCase(
      req.params.universityId,
    );
    res
      .status(200)
      .json({ code: 1, data, message: "University details fetched" });
  } catch (error) {
    next(error);
  }
};

export const editUniversity = async (req, res, next) => {
  try {
    const data = await UniversityUseCases.EditUniversityUseCase(
      req.user.id,
      req.params.universityId,
      req.body,
    );
    res.status(200).json({ code: 1, data, message: "University updated" });
  } catch (error) {
    next(error);
  }
};

export const addUniversityCourse = async (req, res, next) => {
  try {
    const data = await UniversityUseCases.AddUniversityCourseUseCase(
      req.user.id,
      req.body,
    );
    res.status(201).json({ code: 1, data, message: "Course created" });
  } catch (error) {
    next(error);
  }
};

export const addUniversityRequirement = async (req, res, next) => {
  try {
    const data = await UniversityUseCases.AddUniversityRequirementUseCase(
      req.user.id,
      req.body,
    );
    res.status(201).json({ code: 1, data, message: "Requirement created" });
  } catch (error) {
    next(error);
  }
};

export const editUniversityRequirement = async (req, res, next) => {
  try {
    const data = await UniversityUseCases.EditUniversityRequirementUseCase(
      req.user.id,
      req.params.requirementId,
      req.body,
    );
    res.status(200).json({ code: 1, data, message: "Requirement updated" });
  } catch (error) {
    next(error);
  }
};

export const deleteUniversityRequirement = async (req, res, next) => {
  try {
    const data = await UniversityUseCases.DeleteUniversityRequirementUseCase(
      req.user.id,
      req.params.requirementId,
    );
    res.status(200).json({ code: 1, data, message: "Requirement deleted" });
  } catch (error) {
    next(error);
  }
};
