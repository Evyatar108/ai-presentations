import React, { useState, useCallback } from 'react';
import { WelcomeScreen } from './framework/components/WelcomeScreen';
import { DemoPlayer } from './framework/components/DemoPlayer';

export const App: React.FC = () => {
  const [selectedDemoId, setSelectedDemoId] = useState<string | null>(null);
  const [hideInterface, setHideInterface] = useState(false);

  const handleSelectDemo = (demoId: string) => {
    setSelectedDemoId(demoId);
  };

  const handleBackToWelcome = useCallback(() => {
    setSelectedDemoId(null);
    setHideInterface(false);
  }, []);

  return (
    <div style={{ position: 'relative' }}>
      {!selectedDemoId ? (
        <WelcomeScreen onSelectDemo={handleSelectDemo} />
      ) : (
        <DemoPlayer
          demoId={selectedDemoId}
          onBack={handleBackToWelcome}
          onHideInterfaceChange={setHideInterface}
        />
      )}
    </div>
  );
};

export default App;