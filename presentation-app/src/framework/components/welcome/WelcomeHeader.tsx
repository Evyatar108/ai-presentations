import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../theme/ThemeContext';

export const WelcomeHeader: React.FC = () => {
  const theme = useTheme();

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        textAlign: 'center',
        marginBottom: '3rem'
      }}
    >
      <h1 style={{
        fontSize: 48,
        fontWeight: 700,
        color: theme.colors.textPrimary,
        marginBottom: '1rem',
        background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      }}>
        Demo Presentations
      </h1>
      <p style={{
        fontSize: 18,
        color: theme.colors.textSecondary,
        maxWidth: 600,
        margin: '0 auto'
      }}>
        Select a presentation to view
      </p>
    </motion.header>
  );
};
