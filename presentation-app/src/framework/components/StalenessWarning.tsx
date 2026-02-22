import React from 'react';
import { createPortal } from 'react-dom';
import { useStalenessCheck } from '../hooks/useStalenessCheck';
import { clearAlignmentCache, loadAlignment } from '../utils/alignmentLoader';
import type { DemoAlignment } from '../alignment/types';

interface StalenessWarningProps {
  demoId: string;
  isNarratedMode: boolean;
  onAlignmentFixed?: (alignment: DemoAlignment | null) => void;
}

export const StalenessWarning: React.FC<StalenessWarningProps> = ({
  demoId,
  isNarratedMode,
  onAlignmentFixed,
}) => {
  const { staleness, fixing, dismissed, regenerate, dismiss } = useStalenessCheck(demoId);

  // Hidden during narrated playback or when dismissed or not stale
  if (isNarratedMode || dismissed || !staleness?.stale) {
    return null;
  }

  const parts: string[] = [];
  if (staleness.missingMarkers.length > 0) {
    parts.push(`${staleness.missingMarkers.length} marker${staleness.missingMarkers.length !== 1 ? 's' : ''} unresolved`);
  }
  if (staleness.changedSegments.length > 0) {
    parts.push(`${staleness.changedSegments.length} segment${staleness.changedSegments.length !== 1 ? 's' : ''} changed`);
  }
  if (staleness.alignmentMissing) {
    parts.push('alignment.json missing');
  }

  const handleRegenerate = async () => {
    await regenerate();
    // Reload alignment data after regeneration
    clearAlignmentCache(demoId);
    const newAlignment = await loadAlignment(demoId);
    onAlignmentFixed?.(newAlignment);
  };

  return createPortal(
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 10001,
      background: 'rgba(0, 0, 0, 0.75)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <div style={{
        background: '#1e1e1e',
        border: '2px solid #e6a700',
        borderRadius: 12,
        padding: '24px 32px',
        maxWidth: 480,
        textAlign: 'center',
      }}>
        <div style={{
          fontSize: '28px',
          marginBottom: '12px',
        }}>
          <span aria-hidden="true">&#9888;</span>
        </div>

        <h3 style={{
          color: '#f0d060',
          fontSize: '18px',
          fontWeight: 700,
          margin: '0 0 8px',
        }}>
          Stale Narration Data
        </h3>

        <p style={{
          color: '#bbb',
          fontSize: '14px',
          margin: '0 0 20px',
          lineHeight: 1.5,
        }}>
          {parts.join(', ')}
        </p>

        <div style={{
          display: 'flex',
          gap: '10px',
          justifyContent: 'center',
        }}>
          <button
            onClick={handleRegenerate}
            disabled={fixing}
            style={{
              background: fixing ? '#444' : '#e6a700',
              color: fixing ? '#999' : '#111',
              border: 'none',
              borderRadius: 8,
              padding: '8px 20px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: fixing ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {fixing && (
              <span style={{
                display: 'inline-block',
                width: 14,
                height: 14,
                border: '2px solid rgba(150, 150, 150, 0.3)',
                borderTop: '2px solid #999',
                borderRadius: '50%',
                animation: 'staleness-spin 0.8s linear infinite',
              }} />
            )}
            {fixing ? 'Regenerating...' : 'Regenerate'}
          </button>

          <button
            onClick={dismiss}
            style={{
              background: 'transparent',
              color: '#999',
              border: '1px solid #555',
              borderRadius: 8,
              padding: '8px 20px',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            Dismiss
          </button>
        </div>
      </div>

      <style>{`
        @keyframes staleness-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>,
    document.body
  );
};
