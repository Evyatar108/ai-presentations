import { useState, useEffect } from 'react';
import { checkApiHealth } from '../utils/narrationApiClient';

export interface UseApiHealthResult {
  apiAvailable: boolean | null;
}

export function useApiHealth(): UseApiHealthResult {
  const [apiAvailable, setApiAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    checkApiHealth().then(available => {
      setApiAvailable(available);
      if (available) {
        console.log('[useApiHealth] Backend API is available');
      } else {
        console.warn('[useApiHealth] Backend API is not available - edits will be session-only');
      }
    }).catch(() => setApiAvailable(false));
  }, []);

  return { apiAvailable };
}
