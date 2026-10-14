# Business Admin Dashboard: Frontend Guide

> Example responses are illustrative (built from the implemented response shapes); replace with live captures once verified against the dev database.

All endpoints: `GET`, header `Authorization: Bearer <accessToken>`, Business Admin only.

Successful responses: HTTP 200 with `{ code: 0, data, message }`.

Error responses (HTTP 400 / 403 / 404, and 500 for unexpected failures): `{ code: 0, data: null, message }`.

**Exception: 401.** The auth middleware answers a missing or invalid token with `{ "message": "No token provided" }` (or the token verification error text) and no `code` / `data` fields. Read `message` and the HTTP status, not `code`, when handling errors generically. A 403 (`"Forbidden: insufficient permissions"`) means the token is valid but the user is not a Business Admin. A 400 is also returned if the token's user has no business (`"User is not associated with an organization"`).

## Suggested layout

| Widget | Endpoint | Chart |
|---|---|---|
| KPI cards | `/dashboard/summary` | stat tiles |
| Branch comparison | `/dashboard/branches` | grouped bar (students, applications) |
| Sub-agent leaderboard | `/dashboard/sub-agents` | table + horizontal bar on `enrolledStudents` |
| Pipeline | `/dashboard/distribution` → `studentsByLeadStage`, `applicationsByStatus` | bar / funnel (keep the order given) |
| Countries, lead sources | `/dashboard/distribution` → `applicationsByTargetCountry`, `studentsByLeadSource` | donut or horizontal bar |
| Growth | `/dashboard/trends` | line chart, one line per series |

A branch filter dropdown can drive `branchId` on summary, sub-agents, distribution and trends (fill it from `/dashboard/branches`). `/dashboard/branches` itself takes no parameters.

`branchId` rules (all endpoints that accept it): a positive integer. An empty `branchId=` is ignored (same as absent). Anything else returns 400 `"branchId must be a positive integer"`. A branch that does not exist in the admin's business returns 404 `"Branch not found"`.

## GET /dashboard/summary

Headline numbers for the admin's business. Counts are current state and exclude soft-deleted rows.

| Param | Required | Description |
|---|---|---|
| `branchId` | no | Restrict counts to one branch. |

```bash
curl -H "Authorization: Bearer $TOKEN" "$API/dashboard/summary"
curl -H "Authorization: Bearer $TOKEN" "$API/dashboard/summary?branchId=3"
```

```json
{
  "code": 0,
  "data": {
    "branches": { "total": 5, "active": 4 },
    "students": { "total": 320 },
    "subAgents": { "total": 12 },
    "applications": { "total": 410, "active": 238, "enrolled": 142, "rejected": 30 }
  },
  "message": "Dashboard summary fetched"
}
```

- `branches` is **absent** when `branchId` is set (the other counts are then for that branch). Handle a missing `branches` key.
- `applications.active` = applications whose status is neither `Enrolled` nor `Rejected` (so `Draft` counts as active). `total = active + enrolled + rejected`.
- With `branchId`, sub-agents are those assigned to that branch.

## GET /dashboard/branches

One row per non-deleted branch of the business (no parameters), sorted by `students` descending, then name.

```bash
curl -H "Authorization: Bearer $TOKEN" "$API/dashboard/branches"
```

```json
{
  "code": 0,
  "data": [
    {
      "branchId": 1,
      "name": "Branch North",
      "isActive": true,
      "students": 140,
      "subAgents": 5,
      "applications": { "total": 190, "active": 100, "enrolled": 78, "rejected": 12 }
    },
    {
      "branchId": 2,
      "name": "Branch South",
      "isActive": true,
      "students": 96,
      "subAgents": 4,
      "applications": { "total": 120, "active": 70, "enrolled": 41, "rejected": 9 }
    },
    {
      "branchId": 3,
      "name": "Branch East",
      "isActive": false,
      "students": 0,
      "subAgents": 0,
      "applications": { "total": 0, "active": 0, "enrolled": 0, "rejected": 0 }
    }
  ],
  "message": "Branch stats fetched"
}
```

- Branches with no data still appear, with zeros (inactive branches too; check `isActive` if you want to grey them out).
- Rows may not add up to `/dashboard/summary`, for three reasons:
  - Applications that have no branch are not counted in any row, so the sum of rows can be lower than `applications.total`.
  - Branch delete is a soft delete with no cascade. Students and applications in a soft-deleted branch still count in `/summary`, `/distribution` and `/trends`, but appear in no `/branches` row.
  - `subAgents` in each row counts branch assignments (UserBranch rows), so an agent assigned to two branches is counted in both rows and the row sum can exceed `subAgents.total` from `/summary`.

## GET /dashboard/sub-agents

Leaderboard of the business's sub agents, sorted by `enrolledStudents` descending, then `students` descending, then name.

| Param | Required | Description |
|---|---|---|
| `branchId` | no | Only agents assigned to that branch, and only that branch's students/applications. |

```bash
curl -H "Authorization: Bearer $TOKEN" "$API/dashboard/sub-agents?branchId=1"
```

```json
{
  "code": 0,
  "data": [
    {
      "userId": 41,
      "name": "Agent A",
      "companyName": "Partner Co A",
      "status": "Active",
      "students": 38,
      "applications": { "total": 52, "active": 20, "enrolled": 28, "rejected": 4 },
      "enrolledStudents": 25,
      "conversionRate": 65.8
    },
    {
      "userId": 57,
      "name": "Agent B",
      "companyName": null,
      "status": "Active",
      "students": 0,
      "applications": { "total": 0, "active": 0, "enrolled": 0, "rejected": 0 },
      "enrolledStudents": 0,
      "conversionRate": 0
    }
  ],
  "message": "Sub agent stats fetched"
}
```

- `enrolledStudents` = number of the agent's **distinct students** with at least one `Enrolled` application. `applications.enrolled` counts applications, so the two can differ.
- `conversionRate` = `enrolledStudents / students * 100`, rounded to one decimal place; `0` when `students` is 0. It is a percentage number (65.8, not 0.658).
- `companyName` comes from the agent's partner profile: with `branchId`, the profile for that branch; without, their earliest-created non-deleted profile. It is `null` if there is none.
- `status` is the user's account status string (for example `Active`).

**Attribution caveat:** an agent is credited only with students they created themselves (`createdBy`). A student created by a counselor for an agent is not counted. Applications are credited to the agent who created the student.

## GET /dashboard/distribution

Four breakdowns in one call.

| Param | Required | Description |
|---|---|---|
| `branchId` | no | Restrict all four breakdowns to one branch. |

```bash
curl -H "Authorization: Bearer $TOKEN" "$API/dashboard/distribution"
```

```json
{
  "code": 0,
  "data": {
    "studentsByLeadStage": [
      { "key": "NewLead", "count": 110 },
      { "key": "DocumentSubmitted", "count": 80 },
      { "key": "ApplicationSubmitted", "count": 60 },
      { "key": "VisaProcessing", "count": 30 },
      { "key": "Enrolled", "count": 40 }
    ],
    "applicationsByStatus": [
      { "key": "Draft", "count": 35 },
      { "key": "Under Review", "count": 80 },
      { "key": "Pending Documents", "count": 60 },
      { "key": "Offer Letter Issued", "count": 40 },
      { "key": "Visa Processing", "count": 23 },
      { "key": "Enrolled", "count": 142 },
      { "key": "Rejected", "count": 30 }
    ],
    "applicationsByTargetCountry": [
      { "key": "United Kingdom", "count": 200 },
      { "key": "Canada", "count": 120 },
      { "key": "Australia", "count": 70 },
      { "key": "Unknown", "count": 20 }
    ],
    "studentsByLeadSource": [
      { "key": "Website", "count": 160 },
      { "key": "Referral", "count": 125 },
      { "key": "Unknown", "count": 35 }
    ]
  },
  "message": "Dashboard distribution fetched"
}
```

Every entry is `{ key, count }`.

- `studentsByLeadStage` and `applicationsByStatus` have a **fixed order** (pipeline order, as above) and are zero-filled, so all five stages and all seven statuses are always present. Keep the order when charting. If the data ever contains an unexpected value, it is appended after the known keys, sorted by count descending.
- `applicationsByTargetCountry` and `studentsByLeadSource` are sorted by `count` descending (ties by name) and show at most the top 10 keys. Anything beyond that is merged into a single trailing `Other` bucket. Null or blank values are grouped as `Unknown`.
- Countries and lead sources are free-form data, so do not hard-code their keys.

## GET /dashboard/trends

Time series of new students, new applications and enrollments, zero-filled for every period in the range.

| Param | Required | Default | Notes |
|---|---|---|---|
| `groupBy` | no | `month` | `day`, `week` or `month`. |
| `from` | no | depends on `groupBy`, counting the period that contains `to`: `day` → last 30 days (`to` minus 29 days); `week` → last 12 weeks (the Monday 11 weeks before `to`'s week); `month` → last 12 months (1st of the month 11 months before `to`) | `YYYY-MM-DD`. |
| `to` | no | today in the business's time zone | `YYYY-MM-DD`. |
| `branchId` | no | all branches | Restrict to one branch. |

Maximum range (inclusive days, `from` to `to`): `day` 92 days, `week` 731 days (about 2 years), `month` 1827 days (about 5 years). A longer range returns 400 `"Date range too long for groupBy=<x> (max <n> days)"`. Other 400s: invalid `groupBy` (`"groupBy must be one of day, week, month"`), malformed date (`"from must be a date in YYYY-MM-DD format"`, same for `to`), impossible date (`"from is not a valid date"`), or `from` after `to` (`"from must be on or before to"`).

```bash
# Last 12 months by month (all defaults)
curl -H "Authorization: Bearer $TOKEN" "$API/dashboard/trends"

# Weekly, explicit range
curl -H "Authorization: Bearer $TOKEN" \
  "$API/dashboard/trends?groupBy=week&from=2026-09-01&to=2026-10-14&branchId=1"

# Daily, last 30 days (default window)
curl -H "Authorization: Bearer $TOKEN" "$API/dashboard/trends?groupBy=day"
```

```json
{
  "code": 0,
  "data": {
    "groupBy": "week",
    "from": "2026-09-01",
    "to": "2026-10-14",
    "timeZone": "Asia/Karachi",
    "series": [
      { "period": "2026-08-31", "newStudents": 6, "newApplications": 9, "enrolled": 2 },
      { "period": "2026-09-07", "newStudents": 11, "newApplications": 14, "enrolled": 4 },
      { "period": "2026-09-14", "newStudents": 0, "newApplications": 0, "enrolled": 0 },
      { "period": "2026-09-21", "newStudents": 9, "newApplications": 12, "enrolled": 3 },
      { "period": "2026-09-28", "newStudents": 13, "newApplications": 17, "enrolled": 5 },
      { "period": "2026-10-05", "newStudents": 10, "newApplications": 13, "enrolled": 4 },
      { "period": "2026-10-12", "newStudents": 3, "newApplications": 4, "enrolled": 1 }
    ]
  },
  "message": "Dashboard trends fetched"
}
```

- The response echoes the resolved `groupBy`, `from`, `to` and the business `timeZone` (IANA name; defaults to `Asia/Karachi` if the business has none). Day boundaries are computed in that time zone.
- `series[].period` labels: `month` = `YYYY-MM`; `week` = `YYYY-MM-DD` of the **Monday** that starts the week (so the first label can be before `from`, as above); `day` = `YYYY-MM-DD`.
- Every period in the range is present, with `0` for periods with no activity. Each point has the same three numeric keys, so render one line per key (`newStudents`, `newApplications`, `enrolled`).
- **Switching `groupBy` alone is safe.** Each `groupBy` has its own default window (30 days, 12 weeks, 12 months), so a Daily/Weekly/Monthly toggle can omit `from`. If you do send `from` with `day`, keep the range within 92 days.
- **First and last periods can be partial.** For `week` and `month`, if `from` or `to` falls in the middle of a period, that first or last period only counts the days inside `[from, to]`. In the example above, the `2026-08-31` week only counts 1 to 6 September and the `2026-10-12` week only counts 12 to 14 October. Consider styling or annotating these points so a low value is not read as a drop.
- **Empty values:** an empty `from=` or `to=` is treated as absent (defaults apply). An empty `groupBy=` is **not** treated as absent; it returns 400.

**`enrolled` caveat:** this counts applications whose current status is Enrolled, placed at their last update time. Editing an enrolled application later moves it to the period of that edit. Treat it as an approximation of enrollments over time, not an exact history.
