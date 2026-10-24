import DashboardRepository from "../../Infra/db/repositories/dashboard/index.js";
import { LeadStage } from "../../shared/application.constants.js";
import { resolveDashboardBranchId } from "./dashboard.branch.access.js";

// Funnel order; a student at a stage has also passed every stage before it.
const STAGE_ORDER = [
  LeadStage.NewLead,
  LeadStage.DocumentSubmitted,
  LeadStage.ApplicationSubmitted,
  LeadStage.VisaProcessing,
  LeadStage.Enrolled,
];

const toPercentage = (part, whole) =>
  whole === 0 ? null : Math.round((part / whole) * 10000) / 100;

export const GetBranchPipelineUseCase = async (req, branchId) => {
  const parsedBranchId = await resolveDashboardBranchId(req, branchId);

  const rows = await DashboardRepository.GroupStudentsByLeadStage(
    req.user.businessId,
    parsedBranchId,
  );
  const hereNowByStage = Object.fromEntries(
    rows.map(({ leadStage, count }) => [leadStage, count]),
  );

  // reached = students at this stage or any later one.
  let reached = 0;
  const stages = STAGE_ORDER.map((stage) => ({
    stage,
    hereNow: hereNowByStage[stage] ?? 0,
  }))
    .reverse()
    .map((row) => {
      reached += row.hereNow;
      return { ...row, reached };
    })
    .reverse();

  // Conversion from each stage into the next; the last stage has none.
  const stagesWithConversion = stages.map((row, index) => {
    const next = stages[index + 1];
    return {
      ...row,
      conversionToNext: next ? toPercentage(next.reached, row.reached) : null,
    };
  });

  const weakestStep = stagesWithConversion
    .filter((row) => row.conversionToNext != null)
    .reduce(
      (weakest, row) =>
        weakest == null || row.conversionToNext < weakest.conversionToNext
          ? row
          : weakest,
      null,
    );

  const totalLeads = stages[0].reached;
  const enrolled = stages[stages.length - 1].reached;

  return {
    branchId: parsedBranchId,
    stages: stagesWithConversion,
    totalLeads,
    enrolmentRate: toPercentage(enrolled, totalLeads),
    weakestStep:
      weakestStep == null
        ? null
        : {
            fromStage: weakestStep.stage,
            toStage: STAGE_ORDER[STAGE_ORDER.indexOf(weakestStep.stage) + 1],
            conversion: weakestStep.conversionToNext,
          },
    inProgress: totalLeads - enrolled,
  };
};
