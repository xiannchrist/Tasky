import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Task } from '../types/Task';
import { getNotificationTriggerDate } from '../utils/dateUtils';


if (Platform.OS !== 'web') {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  } catch {

  }
}


export const NotificationService = {

  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') {
      return false;
    }

    try {
      const existingStatus = await Notifications.getPermissionsAsync() as any;
      let isGranted = existingStatus?.granted === true || existingStatus?.status === 'granted';

      if (!isGranted) {
        const reqStatus = await Notifications.requestPermissionsAsync() as any;
        isGranted = reqStatus?.granted === true || reqStatus?.status === 'granted';
      }

      return Boolean(isGranted);
    } catch (error) {
      console.warn('Error requesting notification permissions:', error);
      return false;
    }
  },

  /**
   * Schedules a reminder notification for 1 day before the task deadline.
   * Returns the scheduled notification identifier string, or undefined if not scheduled.
   */
  async scheduleDeadlineReminder(task: Task, isEnabled: boolean): Promise<string | undefined> {
    if (!isEnabled || Platform.OS === 'web') {
      return undefined;
    }

    // Do not schedule for completed tasks
    if (task.status === 'Completed') {
      return undefined;
    }

    const triggerDate = getNotificationTriggerDate(task.deadline);
    if (!triggerDate) {
      // Deadline has already passed or trigger time is not valid
      return undefined;
    }

    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return undefined;
      }

      // If previous notification ID exists, cancel it first
      if (task.notificationId) {
        await this.cancelReminder(task.notificationId);
      }

      // Schedule local notification with Expo Notifications
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Tasky Reminder ⏰',
          body: `"${task.title}" is due tomorrow! Don't forget to complete it.`,
          data: { taskId: task.id },
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: triggerDate,
        },
      });

      return notificationId;
    } catch (error) {
      console.warn('Failed to schedule notification:', error);
      return undefined;
    }
  },

  /**
   * Cancels a scheduled reminder notification by ID.
   */
  async cancelReminder(notificationId?: string): Promise<void> {
    if (!notificationId || Platform.OS === 'web') {
      return;
    }

    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.warn('Failed to cancel scheduled notification:', error);
    }
  },

  /**
   * Cancels all scheduled reminders across the app.
   */
  async cancelAllReminders(): Promise<void> {
    if (Platform.OS === 'web') return;

    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.warn('Failed to cancel all notifications:', error);
    }
  },
};
