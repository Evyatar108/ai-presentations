import React, { useState } from 'react';
import { ReducedMotionToggle } from './framework/accessibility/ReducedMotion';
import { WelcomeScreen } from './framework/components/WelcomeScreen';
import { DemoPlayer } from './framework/components/DemoPlayer';

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