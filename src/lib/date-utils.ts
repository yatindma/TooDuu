export function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addDays(d: Date, n: number): Date {
  const result = new Date(d);
  result.setDate(result.getDate() + n);
  return result;
}

export function getToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function getSelectedLabel(
  selectedDate: string,
  todayStr: string,
  today: Date
): string {
  if (selectedDate === todayStr) return "TODAY";

  const selectedDateObj = new Date(selectedDate + "T00:00:00");
  const dayDiff = Math.round(
    (selectedDateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (dayDiff > 0 && dayDiff <= 7) return `TODAY +${dayDiff}`;
  if (dayDiff < 0 && dayDiff >= -7) return `TODAY ${dayDiff}`;

  return selectedDateObj
    .toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
    .toUpperCase();
}
