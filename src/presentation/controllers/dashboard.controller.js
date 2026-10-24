import DashboardUseCases from "../../usecases/dashboard/index.js";

export const getBranchDashboardStats = async (req, res, next) => {
  try {
    const data = await DashboardUseCases.GetBranchDashboardStatsUseCase(
      req,
      req.params.branchId,
    );
    res.status(200).json({ code: 0, data, message: "Dashboard stats fetched" });
  } catch (error) {
    next(error);
  }
};

export const getBranchTargetCountries = async (req, res, next) => {
  try {
    const data = await DashboardUseCases.GetBranchTargetCountriesUseCase(
      req,
      req.params.branchId,
    );
    res.status(200).json({ code: 0, data, message: "Target countries fetched" });
  } catch (error) {
    next(error);
  }
};

export const getBranchPipeline = async (req, res, next) => {
  try {
    const data = await DashboardUseCases.GetBranchPipelineUseCase(
      req,
      req.params.branchId,
    );
    res.status(200).json({ code: 0, data, message: "Pipeline fetched" });
  } catch (error) {
    next(error);
  }
};

export const getBranchUpcomingIntakes = async (req, res, next) => {
  try {
    const data = await DashboardUseCases.GetBranchUpcomingIntakesUseCase(
      req,
      req.params.branchId,
    );
    res.status(200).json({ code: 0, data, message: "Upcoming intakes fetched" });
  } catch (error) {
    next(error);
  }
};

export const getBranchLeadSources = async (req, res, next) => {
  try {
    const data = await DashboardUseCases.GetBranchLeadSourcesUseCase(
      req,
      req.params.branchId,
    );
    res.status(200).json({ code: 0, data, message: "Lead sources fetched" });
  } catch (error) {
    next(error);
  }
};
