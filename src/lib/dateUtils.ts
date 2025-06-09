import { format, startOfWeek, endOfWeek, eachDayOfInterval, isEqual, parseISO, subDays, Day } from 'date-fns';

export const DATE_FORMAT = 'yyyy-MM-dd';

export function getTodayDateString(): string {
  return format(new Date(), DATE_FORMAT);
}

export function getStartOfWeekDate(date: Date = new Date()): Date {
  return startOfWeek(date, { weekStartsOn: 1 }); // Monday as start of week
}

export function getEndOfWeekDate(date: Date = new Date()): Date {
  return endOfWeek(date, { weekStartsOn: 1 });
}

export function getDatesOfWeek(date: Date = new Date()): Date[] {
  const start = getStartOfWeekDate(date);
  const end = getEndOfWeekDate(date);
  return eachDayOfInterval({ start, end });
}

export function isSameDate(date1: Date | string, date2: Date | string): boolean {
  const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
  const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;
  return isEqual(d1, d2);
}

export function formatToDisplayDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM d'); // e.g., Jul 22
}

export function formatToDayOfWeek(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'EEE'); // e.g., Mon
}

export function getDayNumber(date: Date): Day {
  // Sunday is 0, Monday is 1, etc.
  return date.getDay() as Day;
}
