import { useCallback, useEffect } from 'react';
import { notifyParentUpdates, requestParentNotificationPermissions } from '../services/parentNotificationService';
export const useParentNotifications = () => {
  useEffect(() => { void requestParentNotificationPermissions().catch(error => console.warn('Notification permission:', error)); }, []);
  const notifyUpdates = useCallback((name: string, grades: number, alerts: number, replies: number) => notifyParentUpdates(name, grades, alerts, replies), []);
  return { notifyUpdates };
};
