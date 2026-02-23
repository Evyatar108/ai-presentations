import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../theme/ThemeContext';

export const WelcomeFooter: React.FC = () => {
  const theme = useTheme();

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      style={{
        textAlign: 'center',
        marginTop: '4rem',
        color: theme.colors.textMuted,
        fontSize: 14
      }}
    >
      <p>Use keyboard navigation once in presentation mode</p>
    </motion.footer>
  );
};
