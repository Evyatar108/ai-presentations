import { useState, useEffect, useRef, useCallback } from 'react';

export interface StalenessResult {
  stale: boolean;
  missingMarkers: Array<{ segment: string; markerId: string }>;
  changedSegments: string[];
  alignmentMissing: boolean;
}

export interface UseStalenessCheckResult {
  staleness: StalenessResult | null;
  fixing: boolean;
  dismissed: boolean;
  regenerate: () => Promise<void>;
  dismiss: () => void;
}

const isDev = import.meta.env.DEV;

export function useStalenessCheck(demoId: string): UseStalenessCheckResult {
  const [staleness, setStaleness] = useState<StalenessResult | null>(null);
  const [fixing, setFixing] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // Fetch staleness on mount (dev-mode only)
  useEffect(() => {
    if (!isDev) return;

    fetch(`/api/staleness-check?demoId=${encodeURIComponent(demoId)}`)
      .then(r => r.json())
      .then((data: StalenessResult) => {
        if (mountedRef.current) {
          setStaleness(data);
          if (data.stale) {
            const parts: string[] = [];
            if (data.missingMarkers.length > 0) parts.push(`${data.missingMarkers.length} markers unresolved`);
            if (data.changedSegments.length > 0) parts.push(`${data.changedSegments.length} segments changed`);
            if (data.alignmentMissing) parts.push('alignment.json missing');
            console.warn(`[staleness] ${demoId}: ${parts.join(', ')}`);
          }
        }
      })
      .catch(() => {
        // API not available — ignore
      });
  }, [demoId]);

  const regenerate = useCallback(async () => {
    if (!isDev) return;

    setFixing(true);
    try {
      const resp = await fetch('/api/narration/regenerate-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ demoId }),
      });
      const result = await resp.json();
      if (!result.success) {
        console.error('[staleness] Regeneration failed:', result.error);
      }
      // Re-check staleness after fix
      const checkResp = await fetch(`/api/staleness-check?demoId=${encodeURIComponent(demoId)}`);
      const checkData: StalenessResult = await checkResp.json();
      if (mountedRef.current) {
        setStaleness(checkData);
      }
    } catch (err) {
      console.error('[staleness] Regeneration error:', err);
    } finally {
      if (mountedRef.current) {
        setFixing(false);
      }
    }
  }, [demoId]);

  const dismiss = useCallback(() => {
    setDismissed(true);
  }, []);

  return { staleness, fixing, dismissed, regenerate, dismiss };
}
