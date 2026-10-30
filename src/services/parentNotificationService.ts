import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

export const requestParentNotificationPermissions = async () => {
  if (Capacitor.isNativePlatform()) await LocalNotifications.requestPermissions();
  else if ('Notification' in window) await Notification.requestPermission();
};

export const notifyParentUpdates = async (
  studentName: string, newGrades: number, newAlerts: number, newReplies: number,
) => {
  if (newGrades <= 0 && newAlerts <= 0 && newReplies <= 0) return;
  const parts = [newGrades && `${newGrades} درجة`, newAlerts && `${newAlerts} تنبيه`, newReplies && `${newReplies} رد`].filter(Boolean);
  const body = `تحديثات ${studentName}: ${parts.join('، ')}`;
  if (Capacitor.isNativePlatform()) {
    await LocalNotifications.schedule({ notifications: [{ id: Date.now() % 2147483647, title: 'راصد ولي الأمر', body, schedule: { at: new Date(Date.now() + 500) } }] });
  } else if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('راصد ولي الأمر', { body });
  }
};
