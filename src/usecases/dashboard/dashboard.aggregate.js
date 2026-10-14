import { ApplicationStatus } from "../../shared/application.constants.js";

const UNKNOWN_KEY = "Unknown";
const OTHER_KEY = "Other";

const byName = (a, b) => a.name.localeCompare(b.name);

export function summarizeApplications(rows) {
  const summary = { total: 0, active: 0, enrolled: 0, rejected: 0 };
  for (const { key, count } of rows) {
    summary.total += count;
    if (key === ApplicationStatus.Enrolled) {
      summary.enrolled += count;
    } else if (key === ApplicationStatus.Rejected) {
      summary.rejected += count;
    } else {
      summary.active += count;
    }
  }
  return summary;
}

// Known keys first, in pipeline order (zero-filled); unexpected keys after, by count.
export function orderedDistribution(rows, knownKeys) {
  const counts = new Map(knownKeys.map((key) => [key, 0]));
  const extra = [];
  for (const { key, count } of rows) {
    if (counts.has(key)) {
      counts.set(key, counts.get(key) + count);
    } else {
      extra.push({ key, count });
    }
  }
  extra.sort((a, b) => b.count - a.count || String(a.key).localeCompare(String(b.key)));
  return [...knownKeys.map((key) => ({ key, count: counts.get(key) })), ...extra];
}

export function topWithOther(rows, limit = 10) {
  const merged = new Map();
  for (const { key, count } of rows) {
    const label = key == null || String(key).trim() === "" ? UNKNOWN_KEY : key;
    merged.set(label, (merged.get(label) ?? 0) + count);
  }
  const sorted = [...merged]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));

  if (sorted.length <= limit) {
    return sorted;
  }
  // Overflow: a real "Other" key is folded into the synthetic bucket so keys stay unique.
  const ranked = sorted.filter((row) => row.key !== OTHER_KEY);
  const realOther = sorted.find((row) => row.key === OTHER_KEY)?.count ?? 0;
  const otherCount = ranked.slice(limit).reduce((sum, row) => sum + row.count, realOther);
  return [...ranked.slice(0, limit), { key: OTHER_KEY, count: otherCount }];
}

export function fillSeries(periods, bySeries) {
  const lookups = Object.entries(bySeries).map(([name, rows]) => [
    name,
    new Map(rows.map(({ period, count }) => [period, count])),
  ]);
  return periods.map((period) => ({
    period,
    ...Object.fromEntries(lookups.map(([name, lookup]) => [name, lookup.get(period) ?? 0])),
  }));
}

export function conversionRate(enrolledStudents, students) {
  if (students === 0) {
    return 0;
  }
  return Math.round((enrolledStudents / students) * 1000) / 10;
}

function groupRowsBy(rows, idField) {
  const grouped = new Map();
  for (const row of rows) {
    if (!grouped.has(row[idField])) {
      grouped.set(row[idField], []);
    }
    grouped.get(row[idField]).push(row);
  }
  return grouped;
}

export function buildBranchStats(branches, studentRows, subAgentRows, applicationRows) {
  const studentsByBranch = new Map(studentRows.map((r) => [r.branchId, r.count]));
  const subAgentsByBranch = new Map(subAgentRows.map((r) => [r.branchId, r.count]));
  const applicationsByBranch = groupRowsBy(applicationRows, "branchId");

  return branches
    .map((branch) => ({
      branchId: branch.id,
      name: branch.name,
      isActive: branch.isActive,
      students: studentsByBranch.get(branch.id) ?? 0,
      subAgents: subAgentsByBranch.get(branch.id) ?? 0,
      applications: summarizeApplications(applicationsByBranch.get(branch.id) ?? []),
    }))
    .sort((a, b) => b.students - a.students || byName(a, b));
}

export function buildSubAgentStats(agents, studentRows, applicationRows) {
  const studentsByAgent = new Map(studentRows.map((r) => [r.agentId, r.count]));
  const applicationsByAgent = groupRowsBy(applicationRows, "agentId");

  return agents
    .map((agent) => {
      const applications = applicationsByAgent.get(agent.id) ?? [];
      const students = studentsByAgent.get(agent.id) ?? 0;
      const enrolledStudents =
        applications.find((r) => r.key === ApplicationStatus.Enrolled)?.students ?? 0;
      return {
        userId: agent.id,
        name: agent.name,
        companyName: agent.companyName ?? null,
        status: agent.status,
        students,
        applications: summarizeApplications(applications),
        enrolledStudents,
        conversionRate: conversionRate(enrolledStudents, students),
      };
    })
    .sort(
      (a, b) =>
        b.enrolledStudents - a.enrolledStudents || b.students - a.students || byName(a, b),
    );
}
