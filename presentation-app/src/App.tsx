import React, { useState, useCallback, useMemo } from 'react';
import { WelcomeScreen } from './framework/components/WelcomeScreen';
import { DemoPlayer } from './framework/components/DemoPlayer';
import type { AutoplayConfig } from './framework/components/DemoPlayer';

function parseAutoplayParams(): { demoId: string | null; autoplay: AutoplayConfig | undefined } {
  const params = new URLSearchParams(window.location.search);
  const demoId = params.get('demo');
  if (!demoId) return { demoId: null, autoplay: undefined };

  const mode = params.get('autoplay');
  if (mode !== 'narrated') return { demoId, autoplay: undefined };

  return {
    demoId,
    autoplay: {
      mode: 'narrated',
      hideInterface: params.has('hideUI'),
      zoom: params.has('zoom'),
    },
  };
}

export const App: React.FC = () => {
  const urlParams = useMemo(() => parseAutoplayParams(), []);
  const [selectedDemoId, setSelectedDemoId] = useState<string | null>(urlParams.demoId);
  const [, setHideInterface] = useState(false);

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
          autoplay={urlParams.autoplay}
        />
      )}
    </div>
  );
};

export default App;