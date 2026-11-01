const monthYearFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export function formatMonthYear(date: string | null | undefined): string | null {
  if (!date) return null;
  const parsed = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return null;
  return monthYearFormatter.format(parsed);
}

export function formatDateRange(
  start: string | null | undefined,
  end: string | null | undefined,
  isCurrent: boolean,
): string | null {
  const from = formatMonthYear(start);
  const to = isCurrent ? "Present" : formatMonthYear(end);
  if (from && to) return `${from} – ${to}`;
  return from ?? to;
}
