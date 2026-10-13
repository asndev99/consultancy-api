# Business Admin Dashboard — Design

Date: 2026-10-14
Status: Approved in conversation; awaiting written-spec review

## Goal

Give a Business Admin read-only APIs that show their organization's progress:
headline numbers (branches, students, sub agents, applications), a per-branch
breakdown, a sub-agent leaderboard, distributions, and trends over time. The API returns data only; the
frontend renders the charts.

## Scope

In scope:

- Five `GET` endpoints under `/dashboard`, Business Admin only.
- Optional `branchId` filter on summary, sub-agents, distribution and trends.
- Selectable date range and grouping for trends.
- A frontend guide (`docs/dashboard-frontend-guide.md`) written after
  implementation.
- `docs/openapi.yml` entries for every endpoint.

Out of scope:

- Super Admin, Manager or other roles.
- Prisma schema changes or migrations (none are needed).
- Caching or precomputed stats.
- Status-change history (no such table exists; see "enrolled" in Trends).

## Module layout

A separate `dashboard` module following the existing
route → controller → usecase → repository layering.

```
src/presentation/routes/dashboard.route.js        mounted at /dashboard in src/app.js
src/presentation/controllers/dashboard.controller.js
src/usecases/dashboard/
  index.js                          exports DashboardUseCases
  dashboard.scope.js                shared param parsing + branch ownership check
  get.dashboard.summary.usecase.js
  get.branch.stats.usecase.js
  get.sub.agent.stats.usecase.js
  get.distribution.usecase.js
  get.trends.usecase.js
src/Infra/db/repositories/dashboard/
  repo.js                           Prisma queries
  index.js                          logging Proxy, same as other repositories
```

Every route: `authMiddleware` → `verifyRole([UserRoles["Business Admin"]])` →
controller. These are `GET` requests with query params, so params are validated
in the usecase (via `dashboard.scope.js`) rather than with AJV body schemas.
Controllers return the standard `{ code: 0, data, message }` envelope and pass
errors to `next(error)`.

## Scoping and definitions

All queries are scoped to `req.user.businessId`. If `branchId` is given, it
must be a positive integer belonging to that business and not soft-deleted;
otherwise the API returns 400 (malformed) or 404 (not found in this business).

Counts reflect current state and exclude soft-deleted rows:

| Metric | Definition |
|---|---|
| Branches | `Branch` with `isDeleted: false`; reported as `total` and `active` (`isActive: true`) |
| Students | `Student` with `isDeleted: false` |
| Sub agents | `User` with role `Sub Agent`, `isDeleted: false`. With `branchId`: only those with a `UserBranch` for that branch where `deletedAt: null` |
| Applications | `StudentApplication` with `deletedAt: null` |
| Active application | `applicationStatus` not in `Enrolled`, `Rejected` |

## Endpoints

### `GET /dashboard/summary?branchId=`

Headline numbers.

```json
{
  "code": 0,
  "message": "Dashboard summary fetched",
  "data": {
    "branches": { "total": 5, "active": 4 },
    "students": { "total": 320 },
    "subAgents": { "total": 12 },
    "applications": { "total": 410, "active": 180, "enrolled": 150, "rejected": 80 }
  }
}
```

With `branchId`, `branches` is omitted and the rest are counted for that branch.

### `GET /dashboard/branches`

One row per non-deleted branch of the business, for a bar chart. Sorted by
`students` descending, then `name`. Branches with no data appear with zeros.
No `branchId` param.

```json
{
  "code": 0,
  "message": "Branch stats fetched",
  "data": [
    {
      "branchId": 1,
      "name": "Lahore",
      "isActive": true,
      "students": 140,
      "subAgents": 5,
      "applications": { "total": 190, "active": 80, "enrolled": 70, "rejected": 40 }
    }
  ]
}
```

### `GET /dashboard/sub-agents?branchId=`

Sub-agent leaderboard, for a table or bar chart.

```json
{
  "code": 0,
  "message": "Sub agent stats fetched",
  "data": [
    {
      "userId": 42,
      "name": "Ali Raza",
      "companyName": "Raza Consultants",
      "status": "Active",
      "students": 38,
      "applications": { "total": 51, "active": 20, "enrolled": 14, "rejected": 9 },
      "enrolledStudents": 12,
      "conversionRate": 31.6
    }
  ]
}
```

| Field | Definition |
|---|---|
| Agents listed | `User` with role `Sub Agent` in the business, `isDeleted: false`. With `branchId`: only those with a `UserBranch` for that branch where `deletedAt: null`. Agents with no students appear with zeros. |
| `students` | `Student` with `createdBy` = the agent, `isDeleted: false`. With `branchId`: only students in that branch. |
| `applications` | `StudentApplication` of those students with `deletedAt: null`; `active`/`enrolled`/`rejected` as in `/summary`. |
| `enrolledStudents` | Those students with at least one application whose status is `Enrolled`. |
| `conversionRate` | `enrolledStudents / students × 100`, rounded to 1 decimal; `0` when `students` is 0. |
| `companyName` | From the agent's `SubAgentBranchProfile` for `branchId`; without `branchId`, from their earliest-created non-deleted profile; `null` if none. |

- Sorted by `enrolledStudents` descending, then `students` descending, then
  `name`.
- Attribution uses `Student.createdBy`: a student created by a counselor on an
  agent's behalf is not credited to the agent. The stored
  `SubAgentBranchProfile.referredStudents` counter is not used because it can
  drift. The frontend guide states both points.
- Queries: agent list, student `groupBy` on `createdBy`, and application counts
  joined through `studentId`, run with `Promise.all`.

### `GET /dashboard/distribution?branchId=`

Current-state breakdowns for pie, donut or bar charts.

```json
{
  "code": 0,
  "message": "Dashboard distribution fetched",
  "data": {
    "studentsByLeadStage": [{ "key": "NewLead", "count": 120 }],
    "applicationsByStatus": [{ "key": "Draft", "count": 20 }],
    "applicationsByTargetCountry": [{ "key": "UK", "count": 150 }],
    "studentsByLeadSource": [{ "key": "Facebook", "count": 90 }]
  }
}
```

- `studentsByLeadStage` and `applicationsByStatus` always list every value of
  `LeadStage` / `ApplicationStatus` (from `src/shared/application.constants.js`),
  in that pipeline order, with 0 where empty. An application status stored in
  the database that is not in `ApplicationStatus` is reported under its own key,
  after the known ones.
- `applicationsByTargetCountry` (`StudentApplication.targetCountry`) and
  `studentsByLeadSource` (`Student.leadSource`) are sorted by count descending.
  Null or empty values are reported as `"Unknown"`. Only the top 10 keys are
  listed; the remainder is summed into one `"Other"` entry.

### `GET /dashboard/trends?branchId=&from=&to=&groupBy=`

Time series for line graphs.

| Param | Default | Rules |
|---|---|---|
| `groupBy` | `month` | `day`, `week` or `month` |
| `to` | today | `YYYY-MM-DD` |
| `from` | start of the month 11 months before `to` | `YYYY-MM-DD`, must be ≤ `to` |

Range limits: `day` ≤ 92 days, `week` ≤ 2 years, `month` ≤ 5 years. Violations
return 400.

```json
{
  "code": 0,
  "message": "Dashboard trends fetched",
  "data": {
    "groupBy": "month",
    "from": "2025-11-01",
    "to": "2026-10-31",
    "timeZone": "Asia/Karachi",
    "series": [
      { "period": "2025-11", "newStudents": 25, "newApplications": 30, "enrolled": 6 },
      { "period": "2025-12", "newStudents": 0, "newApplications": 4, "enrolled": 0 }
    ]
  }
}
```

- Dates are bucketed in the business's `timeZone` (`Business.timeZone`) using
  Postgres `date_trunc(..., ts AT TIME ZONE tz)` via `prisma.$queryRaw` with
  bound parameters, because Prisma `groupBy` cannot group by truncated dates.
- `from`/`to` are inclusive calendar days in that time zone.
- Period labels: `day` → `YYYY-MM-DD`, `week` → the week's Monday as
  `YYYY-MM-DD`, `month` → `YYYY-MM`.
- Every period in the range is returned; empty periods have zeros.
- `newStudents`: students by `createdAt`. `newApplications`: applications by
  `createdAt`.
- `enrolled`: applications whose current status is `Enrolled`, bucketed by
  `updatedAt`. This approximates the enrollment date because there is no status
  history; any later edit to an enrolled application moves it. The frontend
  guide states this.

## Errors

| Status | When |
|---|---|
| 400 | Invalid `branchId`, `from`, `to` or `groupBy`; `from` after `to`; range over the limit |
| 404 | `branchId` not found in the admin's business |
| 401 / 403 | Existing `authMiddleware` / `verifyRole` |

Errors use the existing `BadRequestException` / `NotFoundException` from
`src/shared/error.js`, handled by `errorMiddleware`.

## Performance

Each usecase runs its independent queries with `Promise.all`. Counts use
`count`/`groupBy` rather than loading rows. No new indexes are added (that would
be a schema change); if dashboards are slow on real data, indexes on
`(businessId, branchId)` and `createdAt` can be proposed separately.

## Testing

The repo has no test suite. Verification is manual against the local dev
database (requires Postgres running):

1. Call each endpoint as a Business Admin, with and without `branchId`.
   For `/sub-agents`, include an agent with no students and confirm zeros.
2. Compare numbers with direct SQL counts using the definitions above.
3. Check error cases: bad `branchId`, a `branchId` from another business,
   bad dates, `from > to`, over-limit ranges, non-admin role (403).
4. Check trends return a continuous series with zero-filled gaps.

## Deliverables

1. Dashboard module (route, controller, usecases, repository) and mount in
   `src/app.js`.
2. `docs/openapi.yml` entries for all five endpoints.
3. `docs/dashboard-frontend-guide.md`: each endpoint's params, response, and
   suggested chart type, sample requests, the `enrolled` caveat, and the
   sub-agent attribution caveat.
