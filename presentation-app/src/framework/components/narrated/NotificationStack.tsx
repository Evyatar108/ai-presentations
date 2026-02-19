import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../theme/ThemeContext';

export interface Notification {
  id: number;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

export interface NotificationStackProps {
  notifications: Notification[];
}

const typeStyles = {
  success: { bg: 'rgba(34, 197, 94, 0.9)', icon: '✓' },
  error: { bg: 'rgba(239, 68, 68, 0.9)', icon: '✕' },
  warning: { bg: 'rgba(245, 158, 11, 0.9)', icon: '⚠' },
  info: { bg: 'rgba(59, 130, 246, 0.9)', icon: 'ℹ' },
} as const;

export const NotificationStack: React.FC<NotificationStackProps> = ({ notifications }) => {
  const theme = useTheme();

  return (
    <div aria-live="polite" aria-atomic="true">
    <AnimatePresence>
      {notifications.map((notification, index) => {
        const style = typeStyles[notification.type];
        return (
          <motion.div
            key={notification.id}
            role="status"
            initial={{ opacity: 0, x: 50, y: 0 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 50, y: 0 }}
            style={{
              position: 'fixed',
              top: 20 + index * 70,
              right: 20,
              background: style.bg,
              color: '#fff',
              padding: '0.75rem 1rem',
              borderRadius: 8,
              fontSize: 14,
              maxWidth: 350,
              zIndex: 10000,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontFamily: theme.fontFamily,
            }}
          >
            <span style={{ fontSize: 16, fontWeight: 'bold' }} aria-hidden="true">{style.icon}</span>
            <span style={{ flex: 1 }}>{notification.message}</span>
          </motion.div>
        );
      })}
    </AnimatePresence>
    </div>
  );
};
