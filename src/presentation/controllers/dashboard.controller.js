import DashboardUseCases from "../../usecases/dashboard/index.js";

export const getDashboardSummary = async (req, res, next) => {
  try {
    const data = await DashboardUseCases.GetDashboardSummaryUseCase(
      req,
      req.query.branchId,
    );
    res.status(200).json({ code: 0, data, message: "Dashboard summary fetched" });
  } catch (error) {
    next(error);
  }
};

export const getBranchStats = async (req, res, next) => {
  try {
    const data = await DashboardUseCases.GetBranchStatsUseCase(req);
    res.status(200).json({ code: 0, data, message: "Branch stats fetched" });
  } catch (error) {
    next(error);
  }
};

export const getDistribution = async (req, res, next) => {
  try {
    const data = await DashboardUseCases.GetDistributionUseCase(
      req,
      req.query.branchId,
    );
    res.status(200).json({ code: 0, data, message: "Dashboard distribution fetched" });
  } catch (error) {
    next(error);
  }
};

export const getSubAgentStats = async (req, res, next) => {
  try {
    const data = await DashboardUseCases.GetSubAgentStatsUseCase(
      req,
      req.query.branchId,
    );
    res.status(200).json({ code: 0, data, message: "Sub agent stats fetched" });
  } catch (error) {
    next(error);
  }
};

export const getTrends = async (req, res, next) => {
  try {
    const data = await DashboardUseCases.GetTrendsUseCase(req, req.query);
    res.status(200).json({ code: 0, data, message: "Dashboard trends fetched" });
  } catch (error) {
    next(error);
  }
};
