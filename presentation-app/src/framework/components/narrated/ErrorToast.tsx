import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ErrorToastProps {
  error: string | null;
  visible: boolean;
}

export const ErrorToast: React.FC<ErrorToastProps> = ({ error, visible }) => {
  return (
    <AnimatePresence>
      {error && visible && (
        <motion.div
          role="alert"
          aria-live="assertive"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          style={{
            position: 'fixed',
            top: 80,
            right: 20,
            background: 'rgba(239, 68, 68, 0.9)',
            color: '#fff',
            padding: '0.75rem 1rem',
            borderRadius: 8,
            fontSize: 14,
            maxWidth: 300,
            zIndex: 1000,
          }}
        >
          {error}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
