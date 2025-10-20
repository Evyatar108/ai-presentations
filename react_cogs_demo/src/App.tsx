import React, { useState } from 'react';
import { ReducedMotionToggle } from './accessibility/ReducedMotion';
import { WelcomeScreen } from './components/WelcomeScreen';
import { DemoPlayer } from './components/DemoPlayer';
import 'reactflow/dist/style.css';

export const App: React.FC = () => {
  const [selectedDemoId, setSelectedDemoId] = useState<string | null>(null);

  const handleSelectDemo = (demoId: string) => {
    setSelectedDemoId(demoId);
  };

  const handleBackToWelcome = () => {
    setSelectedDemoId(null);
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Reduced Motion Toggle (global) */}
      <ReducedMotionToggle />

      {/* Show WelcomeScreen or DemoPlayer based on selection */}
      {!selectedDemoId ? (
        <WelcomeScreen onSelectDemo={handleSelectDemo} />
      ) : (
        <DemoPlayer demoId={selectedDemoId} onBack={handleBackToWelcome} />
      )}
    </div>
  );
};

export default App;