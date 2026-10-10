/**
 * A reading time people can take in at a glance. "2499m" made the reader do
 * the division; this gives "42 h". Under an hour it stays in minutes, under ten
 * hours it keeps one half-hour step ("1.5 h"), and above that whole hours.
 */
export function formatReadTime(minutes: number): string {
  if (!Number.isFinite(minutes) || minutes <= 0) return '1 min';
  if (minutes < 60) return `${Math.max(1, Math.round(minutes))} min`;
  const hours = minutes / 60;
  const rounded = hours < 10 ? Math.round(hours * 2) / 2 : Math.round(hours);
  return `${rounded} h`;
}
