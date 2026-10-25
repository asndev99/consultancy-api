import SubAgentUseCases from "../../usecases/sub-agent/index.js";

export const getSubAgentsByBranch = async (req, res, next) => {
  try {
    const data = await SubAgentUseCases.GetSubAgentsByBranchUseCase(
      req,
      req.params.branchId,
      req.query.searchTerm,
    );
    res.status(200).json({ code: 0, data, message: "Sub agents fetched" });
  } catch (error) {
    next(error);
  }
};

export const assignSubAgentBranch = async (req, res, next) => {
  try {
    const data = await SubAgentUseCases.AssignSubAgentBranchUseCase(
      req,
      req.body,
    );
    res
      .status(201)
      .json({ code: 0, data, message: "Sub agent assigned to branch" });
  } catch (error) {
    next(error);
  }
};

export const editSubAgent = async (req, res, next) => {
  try {
    const data = await SubAgentUseCases.EditSubAgentUseCase(
      req,
      req.params.subAgentId,
      req.body,
    );
    res.status(200).json({ code: 0, data, message: "Sub agent updated" });
  } catch (error) {
    next(error);
  }
};

export const updateSubAgentStatus = async (req, res, next) => {
  try {
    const data = await SubAgentUseCases.UpdateSubAgentStatusUseCase(
      req,
      req.params.subAgentId,
      req.body.status,
    );
    res
      .status(200)
      .json({ code: 0, data, message: "Sub agent status updated" });
  } catch (error) {
    next(error);
  }
};

export const registerSubAgent = async (req, res, next) => {
  try {
    const data = await SubAgentUseCases.RegisterSubAgentUseCase(req, req.body);
    res.status(201).json({ code: 0, data, message: "Invitation sent" });
  } catch (error) {
    next(error);
  }
};

export const getSubAgentApplications = async (req, res, next) => {
  try {
    const { page, limit, status, managerId, admissionOfficerId, searchTerm } =
      req.query;
    const { data, pagination } =
      await SubAgentUseCases.GetSubAgentApplicationsUseCase(
        req,
        req.params.subAgentId,
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
      message: "Sub agent applications fetched",
    });
  } catch (error) {
    next(error);
  }
};
