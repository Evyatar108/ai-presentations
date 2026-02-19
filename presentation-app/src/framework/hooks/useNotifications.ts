import { useState, useCallback, useRef } from 'react';
import type { Notification } from '../components/narrated/NotificationStack';

export interface UseNotificationsResult {
  notifications: Notification[];
  showNotification: (type: Notification['type'], message: string, duration?: number) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
}

export function useNotifications(): UseNotificationsResult {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const idRef = useRef(0);

  const showNotification = useCallback((type: Notification['type'], message: string, duration = 3000) => {
    const id = ++idRef.current;
    setNotifications(prev => [...prev, { id, type, message }]);

    if (duration > 0) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, duration);
    }
  }, []);

  const showSuccess = useCallback((msg: string) => showNotification('success', msg), [showNotification]);
  const showError = useCallback((msg: string) => showNotification('error', msg, 5000), [showNotification]);
  const showWarning = useCallback((msg: string) => showNotification('warning', msg, 4000), [showNotification]);
  const showInfo = useCallback((msg: string) => showNotification('info', msg), [showNotification]);

  return { notifications, showNotification, showSuccess, showError, showWarning, showInfo };
}
