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

// Default window, counting the period that contains `to`:
// day → last 30 days, week → last 12 weeks (from a Monday), month → last 12 months.
function defaultFrom(to, groupBy) {
  if (groupBy === "day") {
    return addDays(to, -29);
  }
  if (groupBy === "week") {
    const daysSinceMonday = (to.getUTCDay() + 6) % 7;
    return addDays(to, -daysSinceMonday - 11 * 7);
  }
  return new Date(Date.UTC(to.getUTCFullYear(), to.getUTCMonth() - 11, 1));
}

export function parseTrendsParams(query, today) {
  const groupBy = query.groupBy ?? "month";
  if (!GROUP_BY_VALUES.includes(groupBy)) {
    throw new BadRequestException("groupBy must be one of day, week, month");
  }

  const hasTo = query.to !== undefined && query.to !== "";
  const hasFrom = query.from !== undefined && query.from !== "";

  const to = parseDate(hasTo ? query.to : today, "to");
  const from = hasFrom ? parseDate(query.from, "from") : defaultFrom(to, groupBy);

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
