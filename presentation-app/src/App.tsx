import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { WelcomeScreen } from './framework/components/WelcomeScreen';
import { DemoPlayer } from './framework/components/DemoPlayer';
import type { AutoplayConfig } from './framework/components/DemoPlayer';
import { pushDemo, pushWelcome } from './framework/hooks/useUrlParams';

function parseAutoplayParams(): { demoId: string | null; autoplay: AutoplayConfig | undefined } {
  const params = new URLSearchParams(window.location.search);
  const demoId = params.get('demo');
  if (!demoId) return { demoId: null, autoplay: undefined };

  const mode = params.get('autoplay');
  if (mode !== 'narrated') return { demoId, autoplay: undefined };

  const signalPort = params.get('signal') ? Number(params.get('signal')) : undefined;

  return {
    demoId,
    autoplay: {
      mode: 'narrated',
      hideInterface: params.has('hideUI'),
      zoom: params.has('zoom'),
      signalPort,
    },
  };
}

export const App: React.FC = () => {
  const urlParams = useMemo(() => parseAutoplayParams(), []);
  const [selectedDemoId, setSelectedDemoId] = useState<string | null>(urlParams.demoId);
  const [, setHideInterface] = useState(false);

  // Listen for popstate (browser back/forward)
  useEffect(() => {
    const onPopState = () => {
      const params = new URLSearchParams(window.location.search);
      const demoId = params.get('demo');
      setSelectedDemoId(demoId);
      if (!demoId) {
        setHideInterface(false);
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const handleSelectDemo = useCallback((demoId: string) => {
    setSelectedDemoId(demoId);
    pushDemo(demoId);
  }, []);

  const handleBackToWelcome = useCallback(() => {
    setSelectedDemoId(null);
    setHideInterface(false);
    pushWelcome();
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
