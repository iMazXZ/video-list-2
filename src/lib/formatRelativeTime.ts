// src/lib/formatRelativeTime.ts
import {
  formatDistanceToNow,
  isToday,
  isYesterday,
  differenceInHours,
} from "date-fns";

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();

  const hoursAgo = differenceInHours(now, date);

  if (isToday(date) || hoursAgo < 24) {
    if (hoursAgo < 1) return "Baru saja";
    return `${hoursAgo} hour ago`;
  }

  if (isYesterday(date)) return "Kemarin";

  return formatDistanceToNow(date, { addSuffix: true });
}
