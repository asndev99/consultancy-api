import DashboardRepository from "../../Infra/db/repositories/dashboard/index.js";
import { resolveDashboardScope } from "./dashboard.scope.js";
import { buildSubAgentStats } from "./dashboard.aggregate.js";

export const GetSubAgentStatsUseCase = async (req, rawBranchId) => {
  const { businessId, branchId } = await resolveDashboardScope(req, rawBranchId);

  const agents = await DashboardRepository.ListSubAgents(businessId, branchId);
  const agentIds = agents.map((agent) => agent.id);

  const [studentRows, applicationRows] = await Promise.all([
    DashboardRepository.GroupStudentsByCreator(businessId, branchId, agentIds),
    DashboardRepository.GroupApplicationsByCreatorAndStatus(businessId, branchId, agentIds),
  ]);

  return buildSubAgentStats(
    agents.map((agent) => ({
      id: agent.id,
      name: agent.name,
      status: agent.status,
      companyName: agent.userBranches[0]?.subAgentPartnerDetails?.companyName ?? null,
    })),
    studentRows,
    applicationRows,
  );
};
