# Business Admin Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Five read-only `GET /dashboard/*` endpoints that give a Business Admin headline numbers, per-branch stats, a sub-agent leaderboard, distributions, and time-series trends for charts.

**Architecture:** A new `dashboard` feature following the existing route → controller → usecase → repository → prisma layering. All parameter parsing, date math, and result shaping live in two pure modules (`dashboard.params.js`, `dashboard.aggregate.js`) that are unit-tested with Node's built-in test runner. Repositories only run Prisma `count`/`groupBy` queries, plus `$queryRaw` for date bucketing and the sub-agent application join.

**Tech Stack:** Node 22 (ESM), Express 5, Prisma 7 (`@prisma/adapter-pg`, Postgres), `node:test` + `node:assert/strict` (built in, no new dependency).

**Spec:** `docs/superpowers/specs/2026-10-14-business-admin-dashboard-design.md`

## Global Constraints

- Work on a feature branch (e.g. `feature/dashboard-apis`), not `main`.
- No Prisma schema changes, no `prisma migrate`, no `prisma db push`.
- No new npm dependencies.
- Every route is `authMiddleware` → `verifyRole([UserRoles["Business Admin"]])` → controller. Query params are validated in usecases, not with AJV.
- Responses use `{ code: 0, data, message }`. Errors are thrown as `BadRequestException` (400) / `NotFoundException` (404) from `src/shared/error.js`.
- Usecases import repositories through `index.js` (the logging Proxy), never `repo.js`.
- All queries are scoped to `req.user.businessId`. A `null` `businessId` → 400 `"User is not associated with an organization"`, never unscoped data.
- Soft deletes: `Branch`/`Student`/`User` → `isDeleted: false`; `StudentApplication`/`UserBranch`/`SubAgentBranchProfile` → `deletedAt: null`.
- Active application = status not in `Enrolled`, `Rejected`.
- Trends: `groupBy` ∈ `day | week | month` (default `month`); `to` default = today in the business time zone; `from` default = 1st of the month 11 months before `to`; dates are `YYYY-MM-DD`, inclusive; max inclusive range: day 92 days, week 731 days (2 years), month 1827 days (5 years).
- Trend labels: day → `YYYY-MM-DD`, week → Monday `YYYY-MM-DD`, month → `YYYY-MM`. Every period is returned, with zero-fill.
- Distribution top-N lists: top 10 by count desc, then one `"Other"` entry; null or blank → `"Unknown"`.
- Update `docs/openapi.yml` in the same commit as each endpoint.
- Commit messages end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

**Decisions where the spec is silent (follow these):**
- Application `branchId` filters (summary, branches, distribution, trends) use `StudentApplication.branchId`. Applications whose `branchId` is null count toward business-wide totals, but no branch gets them.
- In the sub-agent view, branch scoping of students and their applications uses `Student.branchId`, because attribution goes through the student.
- Trends echo the *effective* `from`/`to` (e.g. `to` = today, not the month end).
- The sub-agent usecase fetches the agent list first and then runs the two count queries in parallel, because those queries need the agent ids.
- The spec's `dashboard.scope.js` is split in two: pure parsing goes in `dashboard.params.js` (unit-testable without a DB), and the DB ownership check stays in `dashboard.scope.js`.

## Review Focus

1. **Malformed `branchId`** (`abc`, `0`, `-1`, `1.5`, ` 3`, repeated `?branchId=1&branchId=2`) should return 400, not a 500 or an unscoped query. Pinned by unit tests in Task 1.
2. **Impossible or loosely formatted dates** (`2026-02-30`, `2026-1-5`, `2026-13-01`) should return 400, not roll over silently to another date. Pinned in Task 1.
3. **Week ranges starting mid-week or crossing a year** should give periods that start on Mondays and match Postgres `date_trunc('week')` buckets. Pinned in Task 1 (`buildPeriods`); the SQL alignment is checked manually in Task 7.
4. **Rows near midnight in the business time zone** (e.g. 23:30 Asia/Karachi on the 31st, stored as 18:30 UTC) should bucket into the local day/month. Manual check in Task 7.
5. **Ties and empty data** (branches or agents with equal or zero counts, agents with no students) should sort deterministically and come back as zeros with `conversionRate: 0`, not be dropped. Pinned by unit tests in Task 2.

---

## File Structure

```
package.json                                         modify: "test" script
tests/dashboard/dashboard.params.test.js             create (Task 1)
tests/dashboard/dashboard.aggregate.test.js          create (Task 2)
src/usecases/dashboard/dashboard.params.js           create (Task 1)  pure: query parsing, date math
src/usecases/dashboard/dashboard.aggregate.js        create (Task 2)  pure: shaping DB rows into responses
src/usecases/dashboard/dashboard.scope.js            create (Task 3)  businessId guard + branch ownership
src/usecases/dashboard/index.js                      create (Task 3), extended in Tasks 4-7
src/usecases/dashboard/get.dashboard.summary.usecase.js   (Task 3)
src/usecases/dashboard/get.branch.stats.usecase.js        (Task 4)
src/usecases/dashboard/get.sub.agent.stats.usecase.js     (Task 5)
src/usecases/dashboard/get.distribution.usecase.js        (Task 6)
src/usecases/dashboard/get.trends.usecase.js              (Task 7)
src/Infra/db/repositories/dashboard/repo.js          create (Task 3), extended in Tasks 4-7
src/Infra/db/repositories/dashboard/index.js         create (Task 3), extended in Tasks 4-7
src/presentation/controllers/dashboard.controller.js create (Task 3), extended in Tasks 4-7
src/presentation/routes/dashboard.route.js           create (Task 3), extended in Tasks 4-7
src/app.js                                           modify (Task 3): mount /dashboard
docs/openapi.yml                                     modify (Tasks 3-7)
docs/dashboard-frontend-guide.md                     create (Task 8)
```

---

### Task 1: Test runner + query-parameter parsing (`dashboard.params.js`)

**Files:**
- Modify: `package.json` (`scripts.test`)
- Create: `src/usecases/dashboard/dashboard.params.js`
- Test: `tests/dashboard/dashboard.params.test.js`

**Interfaces:**
- Consumes: `BadRequestException` from `src/shared/error.js`.
- Produces:
  - `parseBranchId(raw: unknown): number | undefined`: throws 400 on malformed input.
  - `parseTrendsParams(query: {groupBy?, from?, to?}, today: "YYYY-MM-DD"): { groupBy: "day"|"week"|"month", from: string, to: string }`
  - `buildPeriods(from: string, to: string, groupBy): string[]`: period labels.
  - `todayInTimeZone(timeZone: string, now?: Date): "YYYY-MM-DD"`
  - `MAX_RANGE_DAYS = { day: 92, week: 731, month: 1827 }`

- [ ] **Step 1: Set the test script**

In `package.json`, replace the `"test"` script with:

```json
    "test": "node --test \"tests/**/*.test.js\"",
```

- [ ] **Step 2: Write the failing tests**

Create `tests/dashboard/dashboard.params.test.js`:

```js
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
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `pnpm test`
Expected: FAIL with `Cannot find module ... dashboard.params.js`.

- [ ] **Step 4: Implement `dashboard.params.js`**

Create `src/usecases/dashboard/dashboard.params.js`:

```js
import { BadRequestException } from "../../shared/error.js";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 24 * 60 * 60 * 1000;

export const GROUP_BY_VALUES = ["day", "week", "month"];

// Inclusive day counts: day ≤ 92 days, week ≤ 2 years, month ≤ 5 years.
export const MAX_RANGE_DAYS = { day: 92, week: 731, month: 1827 };

export function parseBranchId(raw) {
  if (raw === undefined || raw === "") {
    return undefined;
  }
  const value = typeof raw === "string" ? raw : "";
  const branchId = Number(value);
  if (!/^[1-9]\d*$/.test(value) || !Number.isSafeInteger(branchId)) {
    throw new BadRequestException("branchId must be a positive integer");
  }
  return branchId;
}

// Parses a strict YYYY-MM-DD calendar date into a UTC-midnight Date.
function parseDate(raw, name) {
  if (typeof raw !== "string" || !DATE_PATTERN.test(raw)) {
    throw new BadRequestException(`${name} must be a date in YYYY-MM-DD format`);
  }
  const date = new Date(`${raw}T00:00:00Z`);
  if (Number.isNaN(date.getTime()) || formatDate(date) !== raw) {
    throw new BadRequestException(`${name} is not a valid date`);
  }
  return date;
}

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date, days) {
  return new Date(date.getTime() + days * DAY_MS);
}

export function todayInTimeZone(timeZone, now = new Date()) {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function parseTrendsParams(query, today) {
  const groupBy = query.groupBy ?? "month";
  if (!GROUP_BY_VALUES.includes(groupBy)) {
    throw new BadRequestException("groupBy must be one of day, week, month");
  }

  const hasTo = query.to !== undefined && query.to !== "";
  const hasFrom = query.from !== undefined && query.from !== "";

  const to = parseDate(hasTo ? query.to : today, "to");
  const from = hasFrom
    ? parseDate(query.from, "from")
    : new Date(Date.UTC(to.getUTCFullYear(), to.getUTCMonth() - 11, 1));

  if (from > to) {
    throw new BadRequestException("from must be on or before to");
  }

  const days = Math.round((to - from) / DAY_MS) + 1;
  if (days > MAX_RANGE_DAYS[groupBy]) {
    throw new BadRequestException(
      `Date range too long for groupBy=${groupBy} (max ${MAX_RANGE_DAYS[groupBy]} days)`,
    );
  }

  return { groupBy, from: formatDate(from), to: formatDate(to) };
}

export function buildPeriods(from, to, groupBy) {
  const start = parseDate(from, "from");
  const end = parseDate(to, "to");
  const periods = [];

  if (groupBy === "month") {
    for (
      let d = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1));
      d <= end;
      d = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1))
    ) {
      periods.push(formatDate(d).slice(0, 7));
    }
    return periods;
  }

  if (groupBy === "week") {
    const daysSinceMonday = (start.getUTCDay() + 6) % 7;
    for (let d = addDays(start, -daysSinceMonday); d <= end; d = addDays(d, 7)) {
      periods.push(formatDate(d));
    }
    return periods;
  }

  for (let d = start; d <= end; d = addDays(d, 1)) {
    periods.push(formatDate(d));
  }
  return periods;
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `pnpm test`
Expected: all `dashboard.params` tests PASS.

- [ ] **Step 6: Commit**

```bash
git add package.json tests/dashboard/dashboard.params.test.js src/usecases/dashboard/dashboard.params.js
git commit -m "Add dashboard query param parsing with node:test suite

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Result shaping (`dashboard.aggregate.js`)

**Files:**
- Create: `src/usecases/dashboard/dashboard.aggregate.js`
- Test: `tests/dashboard/dashboard.aggregate.test.js`

**Interfaces:**
- Consumes: `ApplicationStatus` from `src/shared/application.constants.js`.
- Produces (all pure):
  - `summarizeApplications(rows: {key, count}[]): { total, active, enrolled, rejected }`
  - `orderedDistribution(rows: {key, count}[], knownKeys: string[]): {key, count}[]`
  - `topWithOther(rows: {key, count}[], limit = 10): {key, count}[]`
  - `fillSeries(periods: string[], bySeries: Record<string, {period, count}[]>): object[]`
  - `conversionRate(enrolledStudents: number, students: number): number`
  - `buildBranchStats(branches: {id, name, isActive}[], studentRows: {branchId, count}[], subAgentRows: {branchId, count}[], applicationRows: {branchId, key, count}[])`: sorted rows in the spec's `/dashboard/branches` shape.
  - `buildSubAgentStats(agents: {id, name, status, companyName}[], studentRows: {agentId, count}[], applicationRows: {agentId, key, count, students}[])`: sorted rows in the spec's `/dashboard/sub-agents` shape.

- [ ] **Step 1: Write the failing tests**

Create `tests/dashboard/dashboard.aggregate.test.js`:

```js
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test`
Expected: the `dashboard.aggregate` tests FAIL with `Cannot find module ... dashboard.aggregate.js`; the `dashboard.params` tests still PASS.

- [ ] **Step 3: Implement `dashboard.aggregate.js`**

Create `src/usecases/dashboard/dashboard.aggregate.js`:

```js
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
  const otherCount = sorted.slice(limit).reduce((sum, row) => sum + row.count, 0);
  return [...sorted.slice(0, limit), { key: OTHER_KEY, count: otherCount }];
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test`
Expected: all tests in both files PASS.

- [ ] **Step 5: Commit**

```bash
git add tests/dashboard/dashboard.aggregate.test.js src/usecases/dashboard/dashboard.aggregate.js
git commit -m "Add dashboard result-shaping helpers

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Module scaffolding + `GET /dashboard/summary`

**Files:**
- Create: `src/Infra/db/repositories/dashboard/repo.js`
- Create: `src/Infra/db/repositories/dashboard/index.js`
- Create: `src/usecases/dashboard/dashboard.scope.js`
- Create: `src/usecases/dashboard/get.dashboard.summary.usecase.js`
- Create: `src/usecases/dashboard/index.js`
- Create: `src/presentation/controllers/dashboard.controller.js`
- Create: `src/presentation/routes/dashboard.route.js`
- Modify: `src/app.js` (import + `app.use("/dashboard", dashboardRouter)`)
- Modify: `docs/openapi.yml` (insert above the top-level `components:` line, currently line 4606)

**Interfaces:**
- Consumes: `parseBranchId` (Task 1), `summarizeApplications` (Task 2), `BranchRepository.FindBranchById(branchId, businessId)` (existing; filters `isDeleted: false`).
- Produces:
  - `resolveDashboardScope(req, rawBranchId): Promise<{ businessId: number, branchId: number | undefined }>`
  - Repo: `subAgentWhere(businessId, branchId)` (internal), `CountBranches(businessId) → {total, active}`, `CountStudents(businessId, branchId) → number`, `CountSubAgents(businessId, branchId) → number`, `GroupApplicationsByStatus(businessId, branchId) → {key, count}[]`
  - `DashboardUseCases.GetDashboardSummaryUseCase(req, rawBranchId)`
  - `dashboardRouter` (default export), with `dashboardRoles` defined in the route file

- [ ] **Step 1: Create the repository**

Create `src/Infra/db/repositories/dashboard/repo.js`:

```js
import { prisma } from "../../prisma.client.js";
import { UserRoles } from "../../../../shared/application.constants.js";

const branchFilter = (branchId) => (branchId != null ? { branchId } : {});

const toKeyCountRows = (grouped, field) =>
  grouped.map((g) => ({ key: g[field], count: g._count._all }));

function subAgentWhere(businessId, branchId) {
  return {
    businessId,
    role: UserRoles["Sub Agent"],
    isDeleted: false,
    ...(branchId != null
      ? { userBranches: { some: { branchId, deletedAt: null } } }
      : {}),
  };
}

export async function CountBranches(businessId) {
  const [total, active] = await Promise.all([
    prisma.branch.count({ where: { businessId, isDeleted: false } }),
    prisma.branch.count({ where: { businessId, isDeleted: false, isActive: true } }),
  ]);
  return { total, active };
}

export function CountStudents(businessId, branchId) {
  return prisma.student.count({
    where: { businessId, isDeleted: false, ...branchFilter(branchId) },
  });
}

export function CountSubAgents(businessId, branchId) {
  return prisma.user.count({ where: subAgentWhere(businessId, branchId) });
}

export async function GroupApplicationsByStatus(businessId, branchId) {
  const grouped = await prisma.studentApplication.groupBy({
    by: ["applicationStatus"],
    where: { businessId, deletedAt: null, ...branchFilter(branchId) },
    _count: { _all: true },
  });
  return toKeyCountRows(grouped, "applicationStatus");
}
```

Create `src/Infra/db/repositories/dashboard/index.js`:

```js
import {
  CountBranches,
  CountStudents,
  CountSubAgents,
  GroupApplicationsByStatus,
} from "./repo.js";

const DashboardRawRepository = {
  CountBranches,
  CountStudents,
  CountSubAgents,
  GroupApplicationsByStatus,
};

const DashboardRepository = new Proxy(DashboardRawRepository, {
  get(target, methodName) {
    const originalMethod = target[methodName];

    if (typeof originalMethod !== "function") {
      return originalMethod;
    }

    return function (...args) {
      console.log(
        `[Dashboard Repository] calling "${String(methodName)}" with:`,
        args,
      );
      return originalMethod.apply(this, args);
    };
  },
});

export default DashboardRepository;
```

- [ ] **Step 2: Create the scope helper and summary usecase**

Create `src/usecases/dashboard/dashboard.scope.js`:

```js
import BranchRepository from "../../Infra/db/repositories/branch/index.js";
import { BadRequestException, NotFoundException } from "../../shared/error.js";
import { parseBranchId } from "./dashboard.params.js";

// Resolves the admin's business and an optional branch that must belong to it.
export async function resolveDashboardScope(req, rawBranchId) {
  if (req.user.businessId == null) {
    throw new BadRequestException("User is not associated with an organization");
  }
  const businessId = Number(req.user.businessId);
  const branchId = parseBranchId(rawBranchId);

  if (branchId !== undefined) {
    const branch = await BranchRepository.FindBranchById(branchId, businessId);
    if (!branch) {
      throw new NotFoundException("Branch not found");
    }
  }

  return { businessId, branchId };
}
```

Create `src/usecases/dashboard/get.dashboard.summary.usecase.js`:

```js
import DashboardRepository from "../../Infra/db/repositories/dashboard/index.js";
import { resolveDashboardScope } from "./dashboard.scope.js";
import { summarizeApplications } from "./dashboard.aggregate.js";

export const GetDashboardSummaryUseCase = async (req, rawBranchId) => {
  const { businessId, branchId } = await resolveDashboardScope(req, rawBranchId);

  const [branches, students, subAgents, applicationRows] = await Promise.all([
    branchId === undefined ? DashboardRepository.CountBranches(businessId) : null,
    DashboardRepository.CountStudents(businessId, branchId),
    DashboardRepository.CountSubAgents(businessId, branchId),
    DashboardRepository.GroupApplicationsByStatus(businessId, branchId),
  ]);

  return {
    ...(branches ? { branches } : {}),
    students: { total: students },
    subAgents: { total: subAgents },
    applications: summarizeApplications(applicationRows),
  };
};
```

Create `src/usecases/dashboard/index.js`:

```js
import { GetDashboardSummaryUseCase } from "./get.dashboard.summary.usecase.js";

const DashboardUseCases = {
  GetDashboardSummaryUseCase,
};

export default DashboardUseCases;
```

- [ ] **Step 3: Create the controller and route, then mount them**

Create `src/presentation/controllers/dashboard.controller.js`:

```js
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
```

Create `src/presentation/routes/dashboard.route.js`:

```js
import express from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { verifyRole } from "../../middleware/verify.role.middleware.js";
import { UserRoles } from "../../shared/application.constants.js";
import { getDashboardSummary } from "../controllers/dashboard.controller.js";

const dashboardRouter = express.Router();

const dashboardRoles = [UserRoles["Business Admin"]];

dashboardRouter.get(
  "/summary",
  authMiddleware,
  verifyRole(dashboardRoles),
  getDashboardSummary,
);

export default dashboardRouter;
```

In `src/app.js`, add after the `subAgentRouter` import:

```js
import dashboardRouter from "./presentation/routes/dashboard.route.js";
```

and after `app.use("/sub-agent", subAgentRouter);`:

```js
app.use("/dashboard", dashboardRouter);
```

- [ ] **Step 4: Add the OpenAPI entry**

In `docs/openapi.yml`, insert this block directly above the top-level `components:` line, keeping the 2-space indent of the other paths:

```yaml
  /dashboard/summary:
    get:
      tags:
        - Dashboard
      summary: Headline numbers for the admin's business
      description: >
        Business Admin only. Counts reflect current state and exclude soft-deleted rows.
        With `branchId`, the `branches` object is omitted and the other counts are for that branch.
        Active applications are those not `Enrolled` or `Rejected`.
      security:
        - bearerAuth: []
      parameters:
        - name: branchId
          in: query
          required: false
          description: Restrict counts to one branch of the admin's business.
          schema:
            type: integer
            minimum: 1
      responses:
        "200":
          description: Dashboard summary fetched
          content:
            application/json:
              schema:
                type: object
                properties:
                  code:
                    type: integer
                    example: 0
                  message:
                    type: string
                    example: Dashboard summary fetched
                  data:
                    type: object
                    properties:
                      branches:
                        type: object
                        description: Omitted when branchId is given.
                        properties:
                          total: { type: integer, example: 5 }
                          active: { type: integer, example: 4 }
                      students:
                        type: object
                        properties:
                          total: { type: integer, example: 320 }
                      subAgents:
                        type: object
                        properties:
                          total: { type: integer, example: 12 }
                      applications:
                        $ref: "#/components/schemas/DashboardApplicationCounts"
        "400":
          description: Invalid branchId, or the user has no business
        "401":
          description: Missing or invalid token
        "403":
          description: Not a Business Admin
        "404":
          description: Branch not found in the admin's business
```

Then add this schema under `components:` → `schemas:`, as the first entry directly below the `  schemas:` line:

```yaml
    DashboardApplicationCounts:
      type: object
      properties:
        total: { type: integer, example: 410 }
        active: { type: integer, example: 180 }
        enrolled: { type: integer, example: 150 }
        rejected: { type: integer, example: 80 }
```

Check the YAML still loads:

Run: `node -e "require('yamljs').load('docs/openapi.yml'); console.log('ok')"`
Expected: `ok`

- [ ] **Step 5: Run unit tests**

Run: `pnpm test`
Expected: all PASS (nothing new; this confirms nothing broke).

- [ ] **Step 6: Manual verification against the dev database**

You need Postgres running with `.env` set. If the server or database can't be reached, **stop and report it; do not mark this step done.**

Start the server: `pnpm dev` (port `4001` unless `PORT` is set). In a second shell, log in as a Business Admin:

```bash
TOKEN=$(curl -s -X POST localhost:4001/user/login -H "Content-Type: application/json" \
  -d '{"email":"<admin email>","password":"<password>"}' | node -pe "JSON.parse(require('fs').readFileSync(0)).data.accessToken")
```

Run each request and check the result:

| Request | Expected |
|---|---|
| `curl -s localhost:4001/dashboard/summary -H "Authorization: Bearer $TOKEN"` | 200; has `branches`, `students`, `subAgents`, `applications` |
| `.../dashboard/summary?branchId=<own branch id>` | 200; **no** `branches` key |
| `.../dashboard/summary?branchId=abc` | 400 `branchId must be a positive integer` |
| `.../dashboard/summary?branchId=<another business's branch id>` | 404 `Branch not found` |
| same request with a Counselor's token | 403 |
| no `Authorization` header | 401 |

Cross-check the numbers with direct counts (replace `<id>`):

```bash
node --input-type=module -e "
import 'dotenv/config';
import { prisma } from './src/Infra/db/prisma.client.js';
const businessId = <id>;
console.log(await prisma.\$queryRaw\`
  SELECT
    (SELECT COUNT(*)::int FROM \"Student\" WHERE \"businessId\" = \${businessId} AND \"isDeleted\" = false) AS students,
    (SELECT COUNT(*)::int FROM \"StudentApplication\" WHERE \"businessId\" = \${businessId} AND \"deletedAt\" IS NULL) AS applications,
    (SELECT COUNT(*)::int FROM \"User\" WHERE \"businessId\" = \${businessId} AND role = 'Sub Agent' AND \"isDeleted\" = false) AS \"subAgents\"\`);
await prisma.\$disconnect();"
```

Expected: these match `students.total`, `applications.total` and `subAgents.total`.

- [ ] **Step 7: Commit**

```bash
git add src/Infra/db/repositories/dashboard src/usecases/dashboard src/presentation/controllers/dashboard.controller.js src/presentation/routes/dashboard.route.js src/app.js docs/openapi.yml
git commit -m "Add GET /dashboard/summary

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: `GET /dashboard/branches`

**Files:**
- Modify: `src/Infra/db/repositories/dashboard/repo.js`, `index.js`
- Create: `src/usecases/dashboard/get.branch.stats.usecase.js`
- Modify: `src/usecases/dashboard/index.js`, `src/presentation/controllers/dashboard.controller.js`, `src/presentation/routes/dashboard.route.js`, `docs/openapi.yml`

**Interfaces:**
- Consumes: `resolveDashboardScope` (Task 3), `buildBranchStats` (Task 2), `toKeyCountRows`/`subAgentWhere` helpers in `repo.js` (Task 3).
- Produces: repo `ListBranches(businessId) → {id, name, isActive}[]`, `GroupStudentsByBranch(businessId) → {branchId, count}[]`, `GroupSubAgentsByBranch(businessId) → {branchId, count}[]`, `GroupApplicationsByBranchAndStatus(businessId) → {branchId, key, count}[]`; `DashboardUseCases.GetBranchStatsUseCase(req)`.

- [ ] **Step 1: Add the repository functions**

Append to `src/Infra/db/repositories/dashboard/repo.js`:

```js
export function ListBranches(businessId) {
  return prisma.branch.findMany({
    where: { businessId, isDeleted: false },
    select: { id: true, name: true, isActive: true },
  });
}

export async function GroupStudentsByBranch(businessId) {
  const grouped = await prisma.student.groupBy({
    by: ["branchId"],
    where: { businessId, isDeleted: false },
    _count: { _all: true },
  });
  return grouped.map((g) => ({ branchId: g.branchId, count: g._count._all }));
}

export async function GroupSubAgentsByBranch(businessId) {
  const grouped = await prisma.userBranch.groupBy({
    by: ["branchId"],
    where: {
      businessId,
      deletedAt: null,
      User: { role: UserRoles["Sub Agent"], isDeleted: false },
    },
    _count: { _all: true },
  });
  return grouped.map((g) => ({ branchId: g.branchId, count: g._count._all }));
}

export async function GroupApplicationsByBranchAndStatus(businessId) {
  const grouped = await prisma.studentApplication.groupBy({
    by: ["branchId", "applicationStatus"],
    where: { businessId, deletedAt: null },
    _count: { _all: true },
  });
  return grouped.map((g) => ({
    branchId: g.branchId,
    key: g.applicationStatus,
    count: g._count._all,
  }));
}
```

In `src/Infra/db/repositories/dashboard/index.js`, add `ListBranches, GroupStudentsByBranch, GroupSubAgentsByBranch, GroupApplicationsByBranchAndStatus` to both the import list and `DashboardRawRepository`.

- [ ] **Step 2: Add the usecase**

Create `src/usecases/dashboard/get.branch.stats.usecase.js`:

```js
import DashboardRepository from "../../Infra/db/repositories/dashboard/index.js";
import { resolveDashboardScope } from "./dashboard.scope.js";
import { buildBranchStats } from "./dashboard.aggregate.js";

export const GetBranchStatsUseCase = async (req) => {
  const { businessId } = await resolveDashboardScope(req, undefined);

  const [branches, studentRows, subAgentRows, applicationRows] = await Promise.all([
    DashboardRepository.ListBranches(businessId),
    DashboardRepository.GroupStudentsByBranch(businessId),
    DashboardRepository.GroupSubAgentsByBranch(businessId),
    DashboardRepository.GroupApplicationsByBranchAndStatus(businessId),
  ]);

  return buildBranchStats(branches, studentRows, subAgentRows, applicationRows);
};
```

In `src/usecases/dashboard/index.js`, import `GetBranchStatsUseCase` from `./get.branch.stats.usecase.js` and add it to `DashboardUseCases`.

- [ ] **Step 3: Add the controller and route**

Append to `dashboard.controller.js`:

```js
export const getBranchStats = async (req, res, next) => {
  try {
    const data = await DashboardUseCases.GetBranchStatsUseCase(req);
    res.status(200).json({ code: 0, data, message: "Branch stats fetched" });
  } catch (error) {
    next(error);
  }
};
```

In `dashboard.route.js`, add `getBranchStats` to the controller import and register:

```js
dashboardRouter.get(
  "/branches",
  authMiddleware,
  verifyRole(dashboardRoles),
  getBranchStats,
);
```

- [ ] **Step 4: Add the OpenAPI entry**

Insert directly after the `/dashboard/summary` path block:

```yaml
  /dashboard/branches:
    get:
      tags:
        - Dashboard
      summary: Per-branch stats for a bar chart
      description: >
        Business Admin only. One row per non-deleted branch, branches with no data included with zeros.
        Sorted by students descending, then name. Applications are attributed by the application's branchId.
      security:
        - bearerAuth: []
      responses:
        "200":
          description: Branch stats fetched
          content:
            application/json:
              schema:
                type: object
                properties:
                  code:
                    type: integer
                    example: 0
                  message:
                    type: string
                    example: Branch stats fetched
                  data:
                    type: array
                    items:
                      type: object
                      properties:
                        branchId: { type: integer, example: 1 }
                        name: { type: string, example: Lahore }
                        isActive: { type: boolean, example: true }
                        students: { type: integer, example: 140 }
                        subAgents: { type: integer, example: 5 }
                        applications:
                          $ref: "#/components/schemas/DashboardApplicationCounts"
        "400":
          description: The user has no business
        "401":
          description: Missing or invalid token
        "403":
          description: Not a Business Admin
```

Run: `node -e "require('yamljs').load('docs/openapi.yml'); console.log('ok')"`
Expected: `ok`

- [ ] **Step 5: Run unit tests**

Run: `pnpm test`
Expected: all PASS.

- [ ] **Step 6: Manual verification**

Use the server and `$TOKEN` from Task 3. If either is unavailable, stop and report it.

| Check | Expected |
|---|---|
| `curl -s localhost:4001/dashboard/branches -H "Authorization: Bearer $TOKEN"` | 200; one row per non-deleted branch, including any with zero students |
| Sum of `students` across rows | equals `students.total` from `/dashboard/summary` |
| Each row's `applications.total` | equals `applications.total` from `/dashboard/summary?branchId=<that id>` |
| Order | students descending; ties ordered by name |

- [ ] **Step 7: Commit**

```bash
git add src/Infra/db/repositories/dashboard src/usecases/dashboard src/presentation/controllers/dashboard.controller.js src/presentation/routes/dashboard.route.js docs/openapi.yml
git commit -m "Add GET /dashboard/branches

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: `GET /dashboard/sub-agents`

**Files:**
- Modify: `src/Infra/db/repositories/dashboard/repo.js`, `index.js`
- Create: `src/usecases/dashboard/get.sub.agent.stats.usecase.js`
- Modify: `src/usecases/dashboard/index.js`, `dashboard.controller.js`, `dashboard.route.js`, `docs/openapi.yml`

**Interfaces:**
- Consumes: `resolveDashboardScope` (Task 3), `buildSubAgentStats` (Task 2), `subAgentWhere`/`branchFilter` in `repo.js` (Task 3).
- Produces: repo `ListSubAgents(businessId, branchId) → { id, name, status, userBranches: [{ subAgentPartnerDetails: { companyName } | null }] }[]`, `GroupStudentsByCreator(businessId, branchId, creatorIds) → {agentId, count}[]`, `GroupApplicationsByCreatorAndStatus(businessId, branchId, creatorIds) → {agentId, key, count, students}[]`; `DashboardUseCases.GetSubAgentStatsUseCase(req, rawBranchId)`.

- [ ] **Step 1: Add the repository functions**

At the top of `repo.js`, add:

```js
import { Prisma } from "../../../../generated/prisma/client.js";
```

Append:

```js
export function ListSubAgents(businessId, branchId) {
  return prisma.user.findMany({
    where: subAgentWhere(businessId, branchId),
    select: {
      id: true,
      name: true,
      status: true,
      // The profile that supplies companyName: the branch's own, or else the earliest one.
      userBranches: {
        where: {
          deletedAt: null,
          ...branchFilter(branchId),
          subAgentPartnerDetails: { is: { deletedAt: null } },
        },
        orderBy: { subAgentPartnerDetails: { createdAt: "asc" } },
        take: 1,
        select: { subAgentPartnerDetails: { select: { companyName: true } } },
      },
    },
  });
}

export async function GroupStudentsByCreator(businessId, branchId, creatorIds) {
  if (creatorIds.length === 0) {
    return [];
  }
  const grouped = await prisma.student.groupBy({
    by: ["createdBy"],
    where: {
      businessId,
      isDeleted: false,
      createdBy: { in: creatorIds },
      ...branchFilter(branchId),
    },
    _count: { _all: true },
  });
  return grouped.map((g) => ({ agentId: g.createdBy, count: g._count._all }));
}

// Applications are credited to the sub agent who created the student.
export function GroupApplicationsByCreatorAndStatus(businessId, branchId, creatorIds) {
  if (creatorIds.length === 0) {
    return Promise.resolve([]);
  }
  return prisma.$queryRaw`
    SELECT s."createdBy" AS "agentId",
           a."applicationStatus" AS "key",
           COUNT(*)::int AS "count",
           COUNT(DISTINCT s."id")::int AS "students"
    FROM "StudentApplication" a
    JOIN "Student" s ON s."id" = a."studentId"
    WHERE s."businessId" = ${businessId}
      AND s."isDeleted" = false
      AND a."deletedAt" IS NULL
      AND s."createdBy" IN (${Prisma.join(creatorIds)})
      ${branchId != null ? Prisma.sql`AND s."branchId" = ${branchId}` : Prisma.empty}
    GROUP BY s."createdBy", a."applicationStatus"`;
}
```

In `index.js`, add `ListSubAgents, GroupStudentsByCreator, GroupApplicationsByCreatorAndStatus` to the import list and to `DashboardRawRepository`.

- [ ] **Step 2: Add the usecase**

Create `src/usecases/dashboard/get.sub.agent.stats.usecase.js`:

```js
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
```

In `src/usecases/dashboard/index.js`, import `GetSubAgentStatsUseCase` and add it to `DashboardUseCases`.

- [ ] **Step 3: Add the controller and route**

Append to `dashboard.controller.js`:

```js
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
```

In `dashboard.route.js`, import `getSubAgentStats` and register:

```js
dashboardRouter.get(
  "/sub-agents",
  authMiddleware,
  verifyRole(dashboardRoles),
  getSubAgentStats,
);
```

- [ ] **Step 4: Add the OpenAPI entry**

Insert after the `/dashboard/branches` block:

```yaml
  /dashboard/sub-agents:
    get:
      tags:
        - Dashboard
      summary: Sub-agent leaderboard
      description: >
        Business Admin only. One row per non-deleted sub agent (with zeros if they have no students).
        Students are attributed by Student.createdBy; a student a counselor created on an agent's
        behalf is not credited to the agent. conversionRate = enrolledStudents / students × 100,
        rounded to 1 decimal, 0 when students is 0. Sorted by enrolledStudents desc, students desc, name.
      security:
        - bearerAuth: []
      parameters:
        - name: branchId
          in: query
          required: false
          description: Only agents assigned to this branch, counting only students in this branch.
          schema:
            type: integer
            minimum: 1
      responses:
        "200":
          description: Sub agent stats fetched
          content:
            application/json:
              schema:
                type: object
                properties:
                  code:
                    type: integer
                    example: 0
                  message:
                    type: string
                    example: Sub agent stats fetched
                  data:
                    type: array
                    items:
                      type: object
                      properties:
                        userId: { type: integer, example: 42 }
                        name: { type: string, example: Ali Raza }
                        companyName: { type: string, nullable: true, example: Raza Consultants }
                        status: { type: string, example: Active }
                        students: { type: integer, example: 38 }
                        applications:
                          $ref: "#/components/schemas/DashboardApplicationCounts"
                        enrolledStudents: { type: integer, example: 12 }
                        conversionRate: { type: number, example: 31.6 }
        "400":
          description: Invalid branchId, or the user has no business
        "401":
          description: Missing or invalid token
        "403":
          description: Not a Business Admin
        "404":
          description: Branch not found in the admin's business
```

Run: `node -e "require('yamljs').load('docs/openapi.yml'); console.log('ok')"`
Expected: `ok`

- [ ] **Step 5: Run unit tests**

Run: `pnpm test`
Expected: all PASS.

- [ ] **Step 6: Manual verification**

Use the server and `$TOKEN` from Task 3. If either is unavailable, stop and report it.

| Check | Expected |
|---|---|
| `curl -s localhost:4001/dashboard/sub-agents -H "Authorization: Bearer $TOKEN"` | 200; one row per sub agent, including agents with no students (`students: 0`, `conversionRate: 0`) |
| Row count | equals `subAgents.total` from `/dashboard/summary` |
| `?branchId=<id>` | only agents assigned to that branch; row count equals `/dashboard/summary?branchId=<id>` `subAgents.total` |
| `?branchId=abc` / another business's branch | 400 / 404 |
| One agent's `students` | equals `SELECT COUNT(*) FROM "Student" WHERE "createdBy" = <agent id> AND "isDeleted" = false` (use the `node --input-type=module` pattern from Task 3) |

- [ ] **Step 7: Commit**

```bash
git add src/Infra/db/repositories/dashboard src/usecases/dashboard src/presentation/controllers/dashboard.controller.js src/presentation/routes/dashboard.route.js docs/openapi.yml
git commit -m "Add GET /dashboard/sub-agents leaderboard

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: `GET /dashboard/distribution`

**Files:**
- Modify: `src/Infra/db/repositories/dashboard/repo.js`, `index.js`
- Create: `src/usecases/dashboard/get.distribution.usecase.js`
- Modify: `src/usecases/dashboard/index.js`, `dashboard.controller.js`, `dashboard.route.js`, `docs/openapi.yml`

**Interfaces:**
- Consumes: `resolveDashboardScope` (Task 3), `orderedDistribution`/`topWithOther` (Task 2), `GroupApplicationsByStatus` (Task 3), `toKeyCountRows`/`branchFilter` in `repo.js`.
- Produces: repo `GroupStudentsByLeadStage`, `GroupStudentsByLeadSource`, `GroupApplicationsByTargetCountry`, each `(businessId, branchId) → {key, count}[]`; `DashboardUseCases.GetDistributionUseCase(req, rawBranchId)`.

- [ ] **Step 1: Add the repository functions**

Append to `repo.js`:

```js
async function groupStudentsBy(field, businessId, branchId) {
  const grouped = await prisma.student.groupBy({
    by: [field],
    where: { businessId, isDeleted: false, ...branchFilter(branchId) },
    _count: { _all: true },
  });
  return toKeyCountRows(grouped, field);
}

export function GroupStudentsByLeadStage(businessId, branchId) {
  return groupStudentsBy("leadStage", businessId, branchId);
}

export function GroupStudentsByLeadSource(businessId, branchId) {
  return groupStudentsBy("leadSource", businessId, branchId);
}

export async function GroupApplicationsByTargetCountry(businessId, branchId) {
  const grouped = await prisma.studentApplication.groupBy({
    by: ["targetCountry"],
    where: { businessId, deletedAt: null, ...branchFilter(branchId) },
    _count: { _all: true },
  });
  return toKeyCountRows(grouped, "targetCountry");
}
```

In `index.js`, add the three exported functions to the import list and to `DashboardRawRepository`.

- [ ] **Step 2: Add the usecase**

Create `src/usecases/dashboard/get.distribution.usecase.js`:

```js
import DashboardRepository from "../../Infra/db/repositories/dashboard/index.js";
import { ApplicationStatus, LeadStage } from "../../shared/application.constants.js";
import { resolveDashboardScope } from "./dashboard.scope.js";
import { orderedDistribution, topWithOther } from "./dashboard.aggregate.js";

export const GetDistributionUseCase = async (req, rawBranchId) => {
  const { businessId, branchId } = await resolveDashboardScope(req, rawBranchId);

  const [leadStageRows, statusRows, countryRows, leadSourceRows] = await Promise.all([
    DashboardRepository.GroupStudentsByLeadStage(businessId, branchId),
    DashboardRepository.GroupApplicationsByStatus(businessId, branchId),
    DashboardRepository.GroupApplicationsByTargetCountry(businessId, branchId),
    DashboardRepository.GroupStudentsByLeadSource(businessId, branchId),
  ]);

  return {
    studentsByLeadStage: orderedDistribution(leadStageRows, Object.values(LeadStage)),
    applicationsByStatus: orderedDistribution(statusRows, Object.values(ApplicationStatus)),
    applicationsByTargetCountry: topWithOther(countryRows),
    studentsByLeadSource: topWithOther(leadSourceRows),
  };
};
```

In `src/usecases/dashboard/index.js`, import `GetDistributionUseCase` and add it to `DashboardUseCases`.

- [ ] **Step 3: Add the controller and route**

Append to `dashboard.controller.js`:

```js
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
```

In `dashboard.route.js`, import `getDistribution` and register:

```js
dashboardRouter.get(
  "/distribution",
  authMiddleware,
  verifyRole(dashboardRoles),
  getDistribution,
);
```

- [ ] **Step 4: Add the OpenAPI entry**

Insert after the `/dashboard/sub-agents` block. Also add this schema under `components:` → `schemas:`, directly after `DashboardApplicationCounts`:

```yaml
    DashboardKeyCount:
      type: object
      properties:
        key: { type: string, example: UK }
        count: { type: integer, example: 150 }
```

Path block:

```yaml
  /dashboard/distribution:
    get:
      tags:
        - Dashboard
      summary: Current-state breakdowns for pie, donut or bar charts
      description: >
        Business Admin only. studentsByLeadStage and applicationsByStatus list every known value in
        pipeline order with 0 where empty; unexpected stored statuses follow the known ones.
        applicationsByTargetCountry and studentsByLeadSource are sorted by count descending,
        null/blank values reported as "Unknown", top 10 kept and the rest summed into "Other".
      security:
        - bearerAuth: []
      parameters:
        - name: branchId
          in: query
          required: false
          schema:
            type: integer
            minimum: 1
      responses:
        "200":
          description: Dashboard distribution fetched
          content:
            application/json:
              schema:
                type: object
                properties:
                  code:
                    type: integer
                    example: 0
                  message:
                    type: string
                    example: Dashboard distribution fetched
                  data:
                    type: object
                    properties:
                      studentsByLeadStage:
                        type: array
                        items: { $ref: "#/components/schemas/DashboardKeyCount" }
                      applicationsByStatus:
                        type: array
                        items: { $ref: "#/components/schemas/DashboardKeyCount" }
                      applicationsByTargetCountry:
                        type: array
                        items: { $ref: "#/components/schemas/DashboardKeyCount" }
                      studentsByLeadSource:
                        type: array
                        items: { $ref: "#/components/schemas/DashboardKeyCount" }
        "400":
          description: Invalid branchId, or the user has no business
        "401":
          description: Missing or invalid token
        "403":
          description: Not a Business Admin
        "404":
          description: Branch not found in the admin's business
```

Run: `node -e "require('yamljs').load('docs/openapi.yml'); console.log('ok')"`
Expected: `ok`

- [ ] **Step 5: Run unit tests**

Run: `pnpm test`
Expected: all PASS.

- [ ] **Step 6: Manual verification**

Use the server and `$TOKEN` from Task 3. If either is unavailable, stop and report it.

| Check | Expected |
|---|---|
| `curl -s localhost:4001/dashboard/distribution -H "Authorization: Bearer $TOKEN"` | 200; `studentsByLeadStage` has all 5 stages, `applicationsByStatus` all 7 statuses, in constant order |
| Sum of `studentsByLeadStage` counts | equals `students.total` from `/dashboard/summary` |
| Sum of `applicationsByStatus` counts | equals `applications.total` |
| `applicationsByTargetCountry` | ≤ 11 entries; descending; any null countries appear as `Unknown` |
| `?branchId=<id>` | sums match `/dashboard/summary?branchId=<id>` |

- [ ] **Step 7: Commit**

```bash
git add src/Infra/db/repositories/dashboard src/usecases/dashboard src/presentation/controllers/dashboard.controller.js src/presentation/routes/dashboard.route.js docs/openapi.yml
git commit -m "Add GET /dashboard/distribution

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: `GET /dashboard/trends`

**Files:**
- Modify: `src/Infra/db/repositories/dashboard/repo.js`, `index.js`
- Create: `src/usecases/dashboard/get.trends.usecase.js`
- Modify: `src/usecases/dashboard/index.js`, `dashboard.controller.js`, `dashboard.route.js`, `docs/openapi.yml`

**Interfaces:**
- Consumes: `resolveDashboardScope` (Task 3); `parseTrendsParams`, `buildPeriods`, `todayInTimeZone` (Task 1); `fillSeries` (Task 2); the `Prisma` import added in Task 5; `ApplicationStatus`.
- Produces: repo `FindBusinessTimeZone(businessId) → { timeZone } | null` and `CountNewStudentsByPeriod(p)`, `CountNewApplicationsByPeriod(p)`, `CountEnrolledApplicationsByPeriod(p)`, where `p = { businessId, branchId, from, to, groupBy, timeZone }` and each returns `{ period, count }[]`; `DashboardUseCases.GetTrendsUseCase(req, query)`.

- [ ] **Step 1: Add the repository functions**

At the top of `repo.js`, change the constants import to:

```js
import { ApplicationStatus, UserRoles } from "../../../../shared/application.constants.js";
```

Append:

```js
export function FindBusinessTimeZone(businessId) {
  return prisma.business.findUnique({
    where: { id: businessId },
    select: { timeZone: true },
  });
}

const PERIOD_LABEL_FORMAT = { day: "YYYY-MM-DD", week: "YYYY-MM-DD", month: "YYYY-MM" };

// table/column come only from the hard-coded callers below, never from user input.
function countByPeriod({ table, column, filter, businessId, branchId, from, to, groupBy, timeZone }) {
  const localTime = Prisma.sql`(${Prisma.raw(`"${column}"`)} AT TIME ZONE ${timeZone})`;
  return prisma.$queryRaw`
    SELECT to_char(date_trunc(${groupBy}, ${localTime}), ${PERIOD_LABEL_FORMAT[groupBy]}) AS "period",
           COUNT(*)::int AS "count"
    FROM ${Prisma.raw(`"${table}"`)}
    WHERE "businessId" = ${businessId}
      AND ${filter}
      ${branchId != null ? Prisma.sql`AND "branchId" = ${branchId}` : Prisma.empty}
      AND ${localTime}::date BETWEEN ${from}::date AND ${to}::date
    GROUP BY 1`;
}

export function CountNewStudentsByPeriod(params) {
  return countByPeriod({
    ...params,
    table: "Student",
    column: "createdAt",
    filter: Prisma.sql`"isDeleted" = false`,
  });
}

export function CountNewApplicationsByPeriod(params) {
  return countByPeriod({
    ...params,
    table: "StudentApplication",
    column: "createdAt",
    filter: Prisma.sql`"deletedAt" IS NULL`,
  });
}

// No status history exists, so updatedAt approximates the enrollment date.
export function CountEnrolledApplicationsByPeriod(params) {
  return countByPeriod({
    ...params,
    table: "StudentApplication",
    column: "updatedAt",
    filter: Prisma.sql`"deletedAt" IS NULL AND "applicationStatus" = ${ApplicationStatus.Enrolled}`,
  });
}
```

In `index.js`, add `FindBusinessTimeZone, CountNewStudentsByPeriod, CountNewApplicationsByPeriod, CountEnrolledApplicationsByPeriod` to the import list and to `DashboardRawRepository`.

- [ ] **Step 2: Add the usecase**

Create `src/usecases/dashboard/get.trends.usecase.js`:

```js
import DashboardRepository from "../../Infra/db/repositories/dashboard/index.js";
import { resolveDashboardScope } from "./dashboard.scope.js";
import { buildPeriods, parseTrendsParams, todayInTimeZone } from "./dashboard.params.js";
import { fillSeries } from "./dashboard.aggregate.js";

const DEFAULT_TIME_ZONE = "Asia/Karachi";

export const GetTrendsUseCase = async (req, query) => {
  const { businessId, branchId } = await resolveDashboardScope(req, query.branchId);

  const business = await DashboardRepository.FindBusinessTimeZone(businessId);
  const timeZone = business?.timeZone ?? DEFAULT_TIME_ZONE;

  const { groupBy, from, to } = parseTrendsParams(query, todayInTimeZone(timeZone));
  const params = { businessId, branchId, from, to, groupBy, timeZone };

  const [newStudents, newApplications, enrolled] = await Promise.all([
    DashboardRepository.CountNewStudentsByPeriod(params),
    DashboardRepository.CountNewApplicationsByPeriod(params),
    DashboardRepository.CountEnrolledApplicationsByPeriod(params),
  ]);

  return {
    groupBy,
    from,
    to,
    timeZone,
    series: fillSeries(buildPeriods(from, to, groupBy), {
      newStudents,
      newApplications,
      enrolled,
    }),
  };
};
```

In `src/usecases/dashboard/index.js`, import `GetTrendsUseCase` and add it to `DashboardUseCases`.

- [ ] **Step 3: Add the controller and route**

Append to `dashboard.controller.js`:

```js
export const getTrends = async (req, res, next) => {
  try {
    const data = await DashboardUseCases.GetTrendsUseCase(req, req.query);
    res.status(200).json({ code: 0, data, message: "Dashboard trends fetched" });
  } catch (error) {
    next(error);
  }
};
```

In `dashboard.route.js`, import `getTrends` and register:

```js
dashboardRouter.get(
  "/trends",
  authMiddleware,
  verifyRole(dashboardRoles),
  getTrends,
);
```

- [ ] **Step 4: Add the OpenAPI entry**

Insert after the `/dashboard/distribution` block:

```yaml
  /dashboard/trends:
    get:
      tags:
        - Dashboard
      summary: Time series for line charts
      description: >
        Business Admin only. Dates are bucketed in the business time zone; from/to are inclusive
        calendar days. Every period in the range is returned, with zeros for empty ones.
        Labels: day → YYYY-MM-DD, week → Monday YYYY-MM-DD, month → YYYY-MM.
        Max range: day 92 days, week 731 days, month 1827 days.
        `enrolled` counts applications currently Enrolled, bucketed by their last update time
        (an approximation; there is no status history).
      security:
        - bearerAuth: []
      parameters:
        - name: branchId
          in: query
          required: false
          schema:
            type: integer
            minimum: 1
        - name: groupBy
          in: query
          required: false
          schema:
            type: string
            enum: [day, week, month]
            default: month
        - name: from
          in: query
          required: false
          description: Defaults to the first day of the month 11 months before `to`.
          schema:
            type: string
            format: date
        - name: to
          in: query
          required: false
          description: Defaults to today in the business time zone.
          schema:
            type: string
            format: date
      responses:
        "200":
          description: Dashboard trends fetched
          content:
            application/json:
              schema:
                type: object
                properties:
                  code:
                    type: integer
                    example: 0
                  message:
                    type: string
                    example: Dashboard trends fetched
                  data:
                    type: object
                    properties:
                      groupBy: { type: string, example: month }
                      from: { type: string, format: date, example: "2025-11-01" }
                      to: { type: string, format: date, example: "2026-10-14" }
                      timeZone: { type: string, example: Asia/Karachi }
                      series:
                        type: array
                        items:
                          type: object
                          properties:
                            period: { type: string, example: "2025-11" }
                            newStudents: { type: integer, example: 25 }
                            newApplications: { type: integer, example: 30 }
                            enrolled: { type: integer, example: 6 }
        "400":
          description: Invalid branchId, from, to or groupBy; from after to; range over the limit
        "401":
          description: Missing or invalid token
        "403":
          description: Not a Business Admin
        "404":
          description: Branch not found in the admin's business
```

Run: `node -e "require('yamljs').load('docs/openapi.yml'); console.log('ok')"`
Expected: `ok`

- [ ] **Step 5: Run unit tests**

Run: `pnpm test`
Expected: all PASS.

- [ ] **Step 6: Manual verification**

Use the server and `$TOKEN` from Task 3. If either is unavailable, stop and report it.

| Request (`/dashboard/trends...`) | Expected |
|---|---|
| no params | 200; `groupBy: "month"`; `to` = today; 12 `series` entries ending with the current month |
| `?groupBy=week&from=2025-12-31&to=2026-01-12` | periods `2025-12-29`, `2026-01-05`, `2026-01-12` |
| `?groupBy=day&from=2026-10-01&to=2026-10-14` | 14 continuous days, zeros where empty |
| `?groupBy=year` / `?from=2026-02-30` / `?from=2026-10-15&to=2026-10-14` / `?groupBy=day&from=2026-01-01&to=2026-12-31` | 400 each |
| sum of `newStudents` over a range covering all data (e.g. `?groupBy=month&from=2021-11-01`, if the data is newer than that) | equals `students.total` |

**Time-zone check (Review Focus #4).** Using the `node --input-type=module` pattern from Task 3, find one student created near local midnight, or set `createdAt` on a throwaway dev row to `'<YYYY-MM-DD> 18:30:00+00'` (= 23:30 Asia/Karachi). Confirm `?groupBy=day` counts it on that local date, not the next day. Revert any row you changed.

**Week alignment check (Review Focus #3).** For a week range, confirm every returned `period` is a Monday and that no SQL row is dropped. Run the trends SQL with the same params, and check that every `period` it returns appears in `buildPeriods`.

- [ ] **Step 7: Commit**

```bash
git add src/Infra/db/repositories/dashboard src/usecases/dashboard src/presentation/controllers/dashboard.controller.js src/presentation/routes/dashboard.route.js docs/openapi.yml
git commit -m "Add GET /dashboard/trends

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Frontend guide

**Files:**
- Create: `docs/dashboard-frontend-guide.md`

**Interfaces:**
- Consumes: the five endpoints as implemented in Tasks 3-7.
- Produces: documentation only.

- [ ] **Step 1: Write the guide**

Create `docs/dashboard-frontend-guide.md` with exactly these sections, filled in from the implemented behaviour. Use one real response captured with curl from the dev server for each example; strip personal names first.

````markdown
# Business Admin Dashboard: Frontend Guide

All endpoints: `GET`, header `Authorization: Bearer <accessToken>`, Business Admin only.
Responses: `{ code: 0, data, message }`. Errors: `{ code: 0, data: null, message }` with HTTP 400 / 401 / 403 / 404.

## Suggested layout

| Widget | Endpoint | Chart |
|---|---|---|
| KPI cards | `/dashboard/summary` | stat tiles |
| Branch comparison | `/dashboard/branches` | grouped bar (students, applications) |
| Sub-agent leaderboard | `/dashboard/sub-agents` | table + horizontal bar on `enrolledStudents` |
| Pipeline | `/dashboard/distribution` → `studentsByLeadStage`, `applicationsByStatus` | bar / funnel (keep the order given) |
| Countries, lead sources | `/dashboard/distribution` → `applicationsByTargetCountry`, `studentsByLeadSource` | donut or horizontal bar |
| Growth | `/dashboard/trends` | line chart, one line per series |

A branch filter dropdown can drive `branchId` on summary, sub-agents, distribution and trends (fill it from `/dashboard/branches`).

## GET /dashboard/summary
Params, example request, example response, note that `branches` is absent when `branchId` is set.

## GET /dashboard/branches
Example request and response; branches with no data appear with zeros; applications without a branch are not in any row.

## GET /dashboard/sub-agents
Params, example request and response, `conversionRate` formula.
**Attribution caveat:** an agent is credited only with students they created themselves (`createdBy`). A student created by a counselor for an agent is not counted.

## GET /dashboard/distribution
Example request and response; fixed key order for stage/status; `Unknown` and `Other` buckets.

## GET /dashboard/trends
Params table (groupBy/from/to with defaults and max ranges), example request and response, label formats, zero-filled series.
**`enrolled` caveat:** this counts applications whose current status is Enrolled, placed at their last update time. Editing an enrolled application later moves it to the period of that edit.
````

Fill every "Params / example request / example response" line with the real content; leave none of those lines as-is. Sample requests use `curl` with `$TOKEN`.

- [ ] **Step 2: Check**

Confirm every endpoint in `docs/openapi.yml` under `/dashboard/` has a section in the guide, and that each example response's keys match the live response.

- [ ] **Step 3: Commit**

```bash
git add docs/dashboard-frontend-guide.md
git commit -m "Add dashboard frontend guide

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```
