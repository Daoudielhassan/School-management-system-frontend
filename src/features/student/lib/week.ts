/** ISO date (`YYYY-MM-DD`) for a given `Date`, in local time. */
export function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Monday of the week containing `date`, as an ISO date string. */
export function getWeekStartIso(date: Date = new Date()): string {
  const day = date.getDay(); // 0 (Sun) – 6 (Sat)
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(date);
  monday.setDate(date.getDate() + diff);
  return toIsoDate(monday);
}
