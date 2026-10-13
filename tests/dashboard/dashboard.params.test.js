import { test } from "node:test";
import assert from "node:assert/strict";
import {
  parseBranchId,
  parseTrendsParams,
  buildPeriods,
  todayInTimeZone,
} from "../../src/usecases/dashboard/dashboard.params.js";

const isBadRequest = (err) => err.statusCode === 400;
const TODAY = "2026-10-14";

test("parseBranchId returns undefined when absent", () => {
  assert.equal(parseBranchId(undefined), undefined);
  assert.equal(parseBranchId(""), undefined);
});

test("parseBranchId parses positive integers", () => {
  assert.equal(parseBranchId("12"), 12);
});

test("parseBranchId rejects malformed values", () => {
  for (const raw of ["abc", "0", "-1", "1.5", " 3", ["1", "2"], "99999999999999999999"]) {
    assert.throws(() => parseBranchId(raw), isBadRequest, String(raw));
  }
});

test("parseTrendsParams defaults to month, today, and 11 months back", () => {
  assert.deepEqual(parseTrendsParams({}, TODAY), {
    groupBy: "month",
    from: "2025-11-01",
    to: "2026-10-14",
  });
});

test("parseTrendsParams default from crosses the year correctly", () => {
  assert.deepEqual(parseTrendsParams({ to: "2026-01-31" }, TODAY), {
    groupBy: "month",
    from: "2025-02-01",
    to: "2026-01-31",
  });
});

test("parseTrendsParams default from for day covers the last 30 days", () => {
  assert.deepEqual(parseTrendsParams({ groupBy: "day" }, TODAY), {
    groupBy: "day",
    from: "2026-09-15",
    to: "2026-10-14",
  });
  assert.equal(parseTrendsParams({ groupBy: "day", to: "2026-01-10" }, TODAY).from, "2025-12-12");
});

test("parseTrendsParams default from for week covers the last 12 weeks from a Monday", () => {
  // 2026-10-14 is a Wednesday; its week starts 2026-10-12, and 11 weeks earlier is 2026-07-27.
  assert.deepEqual(parseTrendsParams({ groupBy: "week" }, TODAY), {
    groupBy: "week",
    from: "2026-07-27",
    to: "2026-10-14",
  });
  assert.equal(parseTrendsParams({ groupBy: "week", to: "2026-01-05" }, TODAY).from, "2025-10-20");
  assert.equal(buildPeriods("2026-07-27", "2026-10-14", "week").length, 12);
});

test("parseTrendsParams passes explicit values through", () => {
  assert.deepEqual(
    parseTrendsParams({ groupBy: "day", from: "2026-10-01", to: "2026-10-14" }, TODAY),
    { groupBy: "day", from: "2026-10-01", to: "2026-10-14" },
  );
});

test("parseTrendsParams rejects unknown groupBy", () => {
  assert.throws(() => parseTrendsParams({ groupBy: "year" }, TODAY), isBadRequest);
});

test("parseTrendsParams rejects malformed or impossible dates", () => {
  for (const bad of ["2026-02-30", "2026-1-5", "20261005", "2026-13-01", ["2026-01-01"]]) {
    assert.throws(() => parseTrendsParams({ from: bad, to: TODAY }, TODAY), isBadRequest, `from=${bad}`);
    assert.throws(() => parseTrendsParams({ to: bad }, TODAY), isBadRequest, `to=${bad}`);
  }
});

test("parseTrendsParams rejects from after to", () => {
  assert.throws(
    () => parseTrendsParams({ from: "2026-10-15", to: "2026-10-14" }, TODAY),
    isBadRequest,
  );
});

test("parseTrendsParams enforces inclusive range limits", () => {
  const ok = (q) => assert.doesNotThrow(() => parseTrendsParams(q, TODAY));
  const bad = (q) => assert.throws(() => parseTrendsParams(q, TODAY), isBadRequest);

  ok({ groupBy: "day", from: "2026-01-01", to: "2026-04-02" }); // 92 days
  bad({ groupBy: "day", from: "2026-01-01", to: "2026-04-03" }); // 93 days
  ok({ groupBy: "week", from: "2024-01-01", to: "2025-12-31" }); // 731 days
  bad({ groupBy: "week", from: "2024-01-01", to: "2026-01-01" }); // 732 days
  ok({ groupBy: "month", from: "2021-01-01", to: "2026-01-01" }); // 1827 days
  bad({ groupBy: "month", from: "2021-01-01", to: "2026-01-02" }); // 1828 days
});

test("buildPeriods month", () => {
  assert.deepEqual(buildPeriods("2025-11-15", "2026-02-03", "month"), [
    "2025-11",
    "2025-12",
    "2026-01",
    "2026-02",
  ]);
});

test("buildPeriods week starts on the Monday of from's week", () => {
  // 2025-12-31 is a Wednesday; its Monday is 2025-12-29.
  assert.deepEqual(buildPeriods("2025-12-31", "2026-01-12", "week"), [
    "2025-12-29",
    "2026-01-05",
    "2026-01-12",
  ]);
});

test("buildPeriods day spans month ends", () => {
  assert.deepEqual(buildPeriods("2026-02-27", "2026-03-02", "day"), [
    "2026-02-27",
    "2026-02-28",
    "2026-03-01",
    "2026-03-02",
  ]);
});

test("todayInTimeZone uses the business time zone", () => {
  const instant = new Date("2026-10-13T20:30:00Z");
  assert.equal(todayInTimeZone("Asia/Karachi", instant), "2026-10-14");
  assert.equal(todayInTimeZone("UTC", instant), "2026-10-13");
});
