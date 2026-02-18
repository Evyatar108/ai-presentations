import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { WithReducedMotionProvider } from './framework/accessibility/ReducedMotion';
import { ThemeProvider } from './framework/theme/ThemeContext';
import { themeOverrides } from './project.config';
import './demos/registry';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root container not found');
}

createRoot(container).render(
  <React.StrictMode>
    <WithReducedMotionProvider>
      <ThemeProvider theme={themeOverrides}>
        <App />
      </ThemeProvider>
    </WithReducedMotionProvider>
  </React.StrictMode>
);