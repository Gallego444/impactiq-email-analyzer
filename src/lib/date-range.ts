import { addDays, differenceInCalendarDays, format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export const MAX_RANGE_DAYS = 90;
export const MIN_RANGE_DAYS = 1;

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function isValidDateString(value: string): boolean {
  if (!DATE_PATTERN.test(value)) return false;
  const parsed = parseISO(value);
  return !Number.isNaN(parsed.getTime());
}

export function countDaysInRange(from: Date, to: Date): number {
  return differenceInCalendarDays(to, from) + 1;
}

export function validateDateRange(
  from: Date | undefined,
  to: Date | undefined
): { valid: boolean; days: number; error: string | null } {
  if (!from || !to) {
    return { valid: false, days: 0, error: null };
  }

  if (from > to) {
    return {
      valid: false,
      days: 0,
      error: "La fecha de inicio debe ser anterior o igual a la fecha de fin.",
    };
  }

  const days = countDaysInRange(from, to);

  if (days < MIN_RANGE_DAYS) {
    return {
      valid: false,
      days,
      error: "El rango debe ser de al menos 1 día.",
    };
  }

  if (days > MAX_RANGE_DAYS) {
    return {
      valid: false,
      days,
      error: `El rango no puede superar ${MAX_RANGE_DAYS} días.`,
    };
  }

  return { valid: true, days, error: null };
}

export function formatDisplayRange(from: Date, to: Date): string {
  const fromStr = format(from, "d MMM yyyy", { locale: es });
  const toStr = format(to, "d MMM yyyy", { locale: es });
  return `${fromStr} → ${toStr}`;
}

export function toIsoDateString(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

/** Gmail query: after is inclusive, before is exclusive — add 1 day to end. */
export function toGmailQueryDates(startDate: string, endDate: string): {
  after: string;
  before: string;
} {
  const after = startDate.replace(/-/g, "/");
  const end = parseISO(endDate);
  const beforeDate = addDays(end, 1);
  const before = format(beforeDate, "yyyy/MM/dd");
  return { after, before };
}
