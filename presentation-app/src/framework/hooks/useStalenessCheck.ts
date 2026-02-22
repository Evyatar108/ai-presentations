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

const isDev = import.meta.env?.DEV;

export function useStalenessCheck(demoId: string): UseStalenessCheckResult {
  const [staleness, setStaleness] = useState<StalenessResult | null>(null);
  const [fixing, setFixing] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // Abort in-flight fetches on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  // Fetch staleness on mount (dev-mode only)
  useEffect(() => {
    if (!isDev) return;

    const controller = new AbortController();
    abortRef.current = controller;

    fetch(`/api/staleness-check?demoId=${encodeURIComponent(demoId)}`, {
      signal: controller.signal,
    })
      .then(r => {
        if (!r.ok) throw new Error(`Staleness check failed: ${r.status}`);
        return r.json();
      })
      .then((data: StalenessResult) => {
        if (controller.signal.aborted) return;
        setStaleness(data);
        if (data.stale) {
          const parts: string[] = [];
          if (data.missingMarkers.length > 0) parts.push(`${data.missingMarkers.length} markers unresolved`);
          if (data.changedSegments.length > 0) parts.push(`${data.changedSegments.length} segments changed`);
          if (data.alignmentMissing) parts.push('alignment.json missing');
          console.warn(`[staleness] ${demoId}: ${parts.join(', ')}`);
        }
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        // API not available — ignore silently in dev
      });

    return () => { controller.abort(); };
  }, [demoId]);

  const regenerate = useCallback(async () => {
    if (!isDev) return;

    setFixing(true);
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const resp = await fetch('/api/narration/regenerate-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ demoId }),
        signal: controller.signal,
      });
      if (!resp.ok) {
        console.error(`[staleness] Regeneration request failed: ${resp.status}`);
        return;
      }
      const result = await resp.json();
      if (!result.success) {
        console.error('[staleness] Regeneration failed:', result.error);
        return;
      }

      // Re-check staleness after fix
      const checkResp = await fetch(`/api/staleness-check?demoId=${encodeURIComponent(demoId)}`, {
        signal: controller.signal,
      });
      if (!checkResp.ok) {
        console.error(`[staleness] Re-check failed: ${checkResp.status}`);
        return;
      }
      const checkData: StalenessResult = await checkResp.json();
      if (!controller.signal.aborted) {
        setStaleness(checkData);
      }
    } catch (err) {
      if (err instanceof DOMException && (err as DOMException).name === 'AbortError') return;
      console.error('[staleness] Regeneration error:', err);
    } finally {
      if (!controller.signal.aborted) {
        setFixing(false);
      }
    }
  }, [demoId]);

  const dismiss = useCallback(() => {
    setDismissed(true);
  }, []);

  return { staleness, fixing, dismissed, regenerate, dismiss };
}
