import { test } from "node:test";
import assert from "node:assert/strict";
import {
  summarizeApplications,
  orderedDistribution,
  topWithOther,
  fillSeries,
  conversionRate,
  buildBranchStats,
  buildSubAgentStats,
} from "../../src/usecases/dashboard/dashboard.aggregate.js";
import { ApplicationStatus } from "../../src/shared/application.constants.js";

const ZERO_APPS = { total: 0, active: 0, enrolled: 0, rejected: 0 };

test("summarizeApplications splits active / enrolled / rejected", () => {
  assert.deepEqual(
    summarizeApplications([
      { key: "Draft", count: 3 },
      { key: "Enrolled", count: 2 },
      { key: "Rejected", count: 1 },
      { key: "Visa Processing", count: 4 },
    ]),
    { total: 10, active: 7, enrolled: 2, rejected: 1 },
  );
  assert.deepEqual(summarizeApplications([]), ZERO_APPS);
});

test("orderedDistribution lists every known key in order, unknown keys after", () => {
  const result = orderedDistribution(
    [
      { key: "Enrolled", count: 2 },
      { key: "Legacy", count: 1 },
      { key: "Draft", count: 5 },
      { key: "Archived", count: 3 },
    ],
    Object.values(ApplicationStatus),
  );
  assert.deepEqual(result, [
    { key: "Draft", count: 5 },
    { key: "Under Review", count: 0 },
    { key: "Pending Documents", count: 0 },
    { key: "Offer Letter Issued", count: 0 },
    { key: "Visa Processing", count: 0 },
    { key: "Enrolled", count: 2 },
    { key: "Rejected", count: 0 },
    { key: "Archived", count: 3 },
    { key: "Legacy", count: 1 },
  ]);
});

test("topWithOther merges blanks into Unknown, keeps top 10, sums the rest", () => {
  const letters = "ABCDEFGHIJKL".split("");
  const rows = letters.map((key, i) => ({ key, count: 12 - i }));
  rows.push({ key: null, count: 5 }, { key: "  ", count: 2 });

  assert.deepEqual(topWithOther(rows), [
    { key: "A", count: 12 },
    { key: "B", count: 11 },
    { key: "C", count: 10 },
    { key: "D", count: 9 },
    { key: "E", count: 8 },
    { key: "F", count: 7 },
    { key: "Unknown", count: 7 },
    { key: "G", count: 6 },
    { key: "H", count: 5 },
    { key: "I", count: 4 },
    { key: "Other", count: 6 },
  ]);
});

test("topWithOther adds no Other entry when within the limit", () => {
  assert.deepEqual(topWithOther([{ key: "UK", count: 1 }]), [{ key: "UK", count: 1 }]);
});

test("fillSeries zero-fills every period and ignores rows outside the range", () => {
  assert.deepEqual(
    fillSeries(["2026-01", "2026-02", "2026-03"], {
      newStudents: [
        { period: "2026-02", count: 4 },
        { period: "2025-12", count: 9 },
      ],
      enrolled: [],
    }),
    [
      { period: "2026-01", newStudents: 0, enrolled: 0 },
      { period: "2026-02", newStudents: 4, enrolled: 0 },
      { period: "2026-03", newStudents: 0, enrolled: 0 },
    ],
  );
});

test("conversionRate is a percentage to one decimal, 0 with no students", () => {
  assert.equal(conversionRate(0, 0), 0);
  assert.equal(conversionRate(12, 38), 31.6);
  assert.equal(conversionRate(1, 3), 33.3);
});

test("buildBranchStats zero-fills and sorts by students desc, then name", () => {
  const result = buildBranchStats(
    [
      { id: 1, name: "Lahore", isActive: true },
      { id: 2, name: "Karachi", isActive: false },
      { id: 3, name: "Islamabad", isActive: true },
    ],
    [
      { branchId: 1, count: 5 },
      { branchId: 3, count: 5 },
    ],
    [{ branchId: 1, count: 2 }],
    [
      { branchId: 1, key: "Enrolled", count: 1 },
      { branchId: 1, key: "Draft", count: 2 },
      { branchId: null, key: "Draft", count: 9 },
    ],
  );
  assert.deepEqual(result, [
    { branchId: 3, name: "Islamabad", isActive: true, students: 5, subAgents: 0, applications: ZERO_APPS },
    {
      branchId: 1,
      name: "Lahore",
      isActive: true,
      students: 5,
      subAgents: 2,
      applications: { total: 3, active: 2, enrolled: 1, rejected: 0 },
    },
    { branchId: 2, name: "Karachi", isActive: false, students: 0, subAgents: 0, applications: ZERO_APPS },
  ]);
});

test("buildSubAgentStats keeps agents with no students and sorts deterministically", () => {
  const result = buildSubAgentStats(
    [
      { id: 7, name: "Zara", status: "Active", companyName: null },
      { id: 8, name: "Ali", status: "Active", companyName: "AR Co" },
      { id: 9, name: "Bilal", status: "Freeze", companyName: null },
    ],
    [
      { agentId: 7, count: 4 },
      { agentId: 8, count: 4 },
    ],
    [
      { agentId: 7, key: "Enrolled", count: 3, students: 2 },
      { agentId: 7, key: "Draft", count: 1, students: 1 },
      { agentId: 8, key: "Enrolled", count: 2, students: 2 },
    ],
  );
  assert.deepEqual(result, [
    {
      userId: 8,
      name: "Ali",
      companyName: "AR Co",
      status: "Active",
      students: 4,
      applications: { total: 2, active: 0, enrolled: 2, rejected: 0 },
      enrolledStudents: 2,
      conversionRate: 50,
    },
    {
      userId: 7,
      name: "Zara",
      companyName: null,
      status: "Active",
      students: 4,
      applications: { total: 4, active: 1, enrolled: 3, rejected: 0 },
      enrolledStudents: 2,
      conversionRate: 50,
    },
    {
      userId: 9,
      name: "Bilal",
      companyName: null,
      status: "Freeze",
      students: 0,
      applications: ZERO_APPS,
      enrolledStudents: 0,
      conversionRate: 0,
    },
  ]);
});

test("topWithOther folds a real 'Other' key into the overflow bucket (unique keys, total preserved)", () => {
  const rows = [{ key: "Other", count: 100 }];
  for (let i = 1; i <= 11; i++) {
    rows.push({ key: `C${String(i).padStart(2, "0")}`, count: 50 - i });
  }
  const result = topWithOther(rows);
  const keys = result.map((r) => r.key);
  assert.equal(new Set(keys).size, keys.length);
  assert.equal(keys.filter((k) => k === "Other").length, 1);
  assert.equal(
    result.reduce((s, r) => s + r.count, 0),
    rows.reduce((s, r) => s + r.count, 0),
  );
  assert.equal(result.length, 11);
  assert.deepEqual(result[10], { key: "Other", count: 100 + 39 });
});
