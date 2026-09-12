/** Clock-style time, e.g. "4:19 pm". */
export function formatTime(iso: string): string {
  const d = new Date(iso);
  const hours = d.getHours();
  const display = hours % 12 === 0 ? 12 : hours % 12;
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return display + ":" + minutes + (hours >= 12 ? " pm" : " am");
}

/** Short hour label for chart axes, e.g. "7", "12", "8". */
export function hourLabel(hour: number): string {
  return String(hour % 12 === 0 ? 12 : hour % 12);
}

/** Receipt date in an unambiguous international form, e.g. "12 Sep 2026". */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function pluralize(count: number, one: string, many: string): string {
  return count + " " + (count === 1 ? one : many);
}
