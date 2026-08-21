import { DueStatus } from '../types/Task';

/**
 * Format an ISO date string into a clean, human-readable date.
 * Example: "Aug 25, 2026 • 5:00 PM"
 */
export const formatDateTime = (isoString: string): string => {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return 'Invalid date';

    const dateOptions: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    };

    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    };

    const formattedDate = date.toLocaleDateString('en-US', dateOptions);
    const formattedTime = date.toLocaleTimeString('en-US', timeOptions);

    return `${formattedDate} • ${formattedTime}`;
  } catch {
    return 'Invalid date';
  }
};

/**
 * Format date only (e.g. "Aug 25, 2026")
 */
export const formatDateOnly = (isoString: string): string => {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return 'Invalid date';
  }
};

/**
 * Format time only (e.g. "5:00 PM")
 */
export const formatTimeOnly = (isoString: string): string => {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return 'Invalid time';
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return 'Invalid time';
  }
};

/**
 * Determines the due status of a deadline string.
 */
export const getDueStatus = (deadlineIsoString: string, isCompleted = false): DueStatus => {
  if (isCompleted) {
    return 'Upcoming';
  }

  const deadline = new Date(deadlineIsoString);
  const now = new Date();

  if (isNaN(deadline.getTime())) {
    return 'Upcoming';
  }

  // Compare day boundaries
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const startOfDayAfterTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2);
  const startOfDueSoonBoundary = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 4);

  // If before right now
  if (deadline.getTime() < now.getTime()) {
    return 'Overdue';
  }

  if (deadline.getTime() < startOfTomorrow.getTime()) {
    return 'Due Today';
  }

  if (deadline.getTime() < startOfDayAfterTomorrow.getTime()) {
    return 'Due Tomorrow';
  }

  if (deadline.getTime() < startOfDueSoonBoundary.getTime()) {
    return 'Due Soon';
  }

  return 'Upcoming';
};

/**
 * Checks if a task is "Due Soon" (due within 3 days or today/overdue and not completed)
 */
export const isTaskDueSoon = (deadlineIsoString: string, isCompleted = false): boolean => {
  if (isCompleted) return false;
  const status = getDueStatus(deadlineIsoString, isCompleted);
  return status === 'Overdue' || status === 'Due Today' || status === 'Due Tomorrow' || status === 'Due Soon';
};

/**
 * Calculates the notification trigger date: exactly 1 day (24 hours) prior to deadline.
 * If 1 day prior is already past, schedules 1 hour prior or returns null if already overdue.
 */
export const getNotificationTriggerDate = (deadlineIsoString: string): Date | null => {
  const deadline = new Date(deadlineIsoString);
  const now = new Date();

  if (isNaN(deadline.getTime()) || deadline.getTime() <= now.getTime()) {
    return null;
  }

  // 1 day before
  const oneDayBefore = new Date(deadline.getTime() - 24 * 60 * 60 * 1000);
  if (oneDayBefore.getTime() > now.getTime()) {
    return oneDayBefore;
  }

  // If less than 24 hours away but more than 30 minutes away
  const thirtyMinsBefore = new Date(deadline.getTime() - 30 * 60 * 1000);
  if (thirtyMinsBefore.getTime() > now.getTime()) {
    return thirtyMinsBefore;
  }

  return null;
};

/**
 * Returns a friendly greeting based on current time of day.
 */
export const getTimeBasedGreeting = (): { greeting: string; emoji: string } => {
  const hour = new Date().getHours();
  if (hour < 12) {
    return { greeting: 'Good morning', emoji: '👋' };
  } else if (hour < 17) {
    return { greeting: 'Good afternoon', emoji: '☀️' };
  } else {
    return { greeting: 'Good evening', emoji: '🌙' };
  }
};

/**
 * Returns uppercase full day and date matching reference style (e.g. "FRIDAY, AUGUST 21").
 */
export const getTodayFormattedHeader = (): string => {
  const now = new Date();
  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
  const monthName = now.toLocaleDateString('en-US', { month: 'long' }).toUpperCase();
  const dayNum = now.getDate();
  return `${dayName}, ${monthName} ${dayNum}`;
};

