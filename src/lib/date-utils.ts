/**
 * Formats a Date object as a local YYYY-MM-DD string without UTC conversion offset bugs.
 */
export const getLocalDateStr = (d = new Date()): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Returns difference in calendar days between today (local) and a YYYY-MM-DD target date string.
 * Negative number = past/overdue, 0 = today, positive = future.
 */
export const diffDaysFromToday = (dateStr: string): number => {
  const today = getLocalDateStr();
  if (dateStr === today) return 0;
  const d1 = new Date(today + 'T00:00:00');
  const d2 = new Date(dateStr + 'T00:00:00');
  return Math.round((d2.getTime() - d1.getTime()) / 86400000);
};
