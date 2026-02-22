import { useState, useCallback, useRef, useEffect } from 'react';
import type { Notification } from '../components/narrated/NotificationStack';

const MAX_NOTIFICATIONS = 10;

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
  const timersRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  // Clear all pending timers on unmount
  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      for (const id of timers) clearTimeout(id);
      timers.clear();
    };
  }, []);

  const showNotification = useCallback((type: Notification['type'], message: string, duration = 3000) => {
    const id = ++idRef.current;
    setNotifications(prev => {
      const next = [...prev, { id, type, message }];
      // Cap at MAX_NOTIFICATIONS — drop oldest
      return next.length > MAX_NOTIFICATIONS ? next.slice(-MAX_NOTIFICATIONS) : next;
    });

    if (duration > 0) {
      const timerId = setTimeout(() => {
        timersRef.current.delete(timerId);
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, duration);
      timersRef.current.add(timerId);
    }
  }, []);

  const showSuccess = useCallback((msg: string) => showNotification('success', msg), [showNotification]);
  const showError = useCallback((msg: string) => showNotification('error', msg, 5000), [showNotification]);
  const showWarning = useCallback((msg: string) => showNotification('warning', msg, 4000), [showNotification]);
  const showInfo = useCallback((msg: string) => showNotification('info', msg), [showNotification]);

  return { notifications, showNotification, showSuccess, showError, showWarning, showInfo };
}
