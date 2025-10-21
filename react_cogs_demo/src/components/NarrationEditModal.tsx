import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface NarrationEditModalProps {
  slideKey: string;
  segmentId: string;
  currentText: string;
  isRegenerating: boolean;
  regenerationError: string | null;
  onSave: (newText: string, regenerateAudio: boolean) => Promise<void>;
  onCancel: () => void;
}

export const NarrationEditModal: React.FC<NarrationEditModalProps> = ({
  slideKey,
  segmentId,
  currentText,
  isRegenerating,
  regenerationError,
  onSave,
  onCancel
}) => {
  const [text, setText] = useState(currentText);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isRegenerating) {
        onCancel();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel, isRegenerating]);

  const handleSaveAndRegenerate = async () => {
    await onSave(text, true);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        fontFamily: 'Inter, system-ui, sans-serif'
      }}
      onClick={!isRegenerating ? onCancel : undefined}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#1e293b',
          borderRadius: 12,
          padding: '2rem',
          width: '90%',
          maxWidth: 600,
          border: '1px solid rgba(148, 163, 184, 0.2)'
        }}
      >
        <h2 style={{ 
          color: '#f1f5f9', 
          marginBottom: '1rem',
          fontSize: 20,
          fontWeight: 600
        }}>
          Edit Narration - {slideKey}:{segmentId}
        </h2>
        
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isRegenerating}
          autoFocus
          style={{
            width: '100%',
            minHeight: 150,
            padding: '1rem',
            background: '#0f172a',
            color: '#f1f5f9',
            border: '1px solid rgba(148, 163, 184, 0.3)',
            borderRadius: 8,
            fontSize: 14,
            lineHeight: 1.6,
            fontFamily: 'Inter, system-ui, sans-serif',
            resize: 'vertical',
            outline: 'none',
            boxSizing: 'border-box',
            opacity: isRegenerating ? 0.6 : 1
          }}
        />
        
        <div style={{ 
          color: '#94a3b8', 
          fontSize: 12, 
          marginTop: '0.5rem' 
        }}>
          Character count: {text.length}
        </div>
        
        <div style={{
          background: 'rgba(251, 146, 60, 0.1)',
          border: '1px solid rgba(251, 146, 60, 0.3)',
          borderRadius: 6,
          padding: '0.75rem',
          marginTop: '1rem',
          color: '#fb923c',
          fontSize: 13,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span>⚠️</span>
          <span>Changes are temporary (session only)</span>
        </div>
        
        {/* Error message */}
        {regenerationError && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 6,
            padding: '0.75rem',
            marginTop: '1rem',
            color: '#ef4444',
            fontSize: 13,
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.5rem'
          }}>
            <span style={{ flexShrink: 0 }}>❌</span>
            <div>
              <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                Audio Regeneration Failed
              </div>
              <div style={{ fontSize: 12, opacity: 0.9 }}>
                {regenerationError}
              </div>
              <div style={{ fontSize: 11, opacity: 0.7, marginTop: '0.25rem' }}>
                You can retry or save without audio regeneration.
              </div>
            </div>
          </div>
        )}
        
        <div style={{
          display: 'flex',
          gap: '1rem',
          marginTop: '1.5rem',
          justifyContent: 'flex-end',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={onCancel}
            disabled={isRegenerating}
            style={{
              background: 'transparent',
              border: '1px solid #475569',
              color: '#94a3b8',
              padding: '0.75rem 1.5rem',
              borderRadius: 8,
              cursor: isRegenerating ? 'not-allowed' : 'pointer',
              opacity: isRegenerating ? 0.5 : 1,
              fontSize: 14,
              fontWeight: 500,
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (!isRegenerating) {
                e.currentTarget.style.borderColor = '#64748b';
                e.currentTarget.style.color = '#cbd5e1';
              }
            }}
            onMouseLeave={(e) => {
              if (!isRegenerating) {
                e.currentTarget.style.borderColor = '#475569';
                e.currentTarget.style.color = '#94a3b8';
              }
            }}
          >
            Cancel
          </button>
          
          <button
            onClick={() => onSave(text, false)}
            disabled={isRegenerating}
            style={{
              background: 'transparent',
              border: '1px solid #00B7C3',
              color: '#00B7C3',
              padding: '0.75rem 1.5rem',
              borderRadius: 8,
              cursor: isRegenerating ? 'not-allowed' : 'pointer',
              opacity: isRegenerating ? 0.5 : 1,
              fontSize: 14,
              fontWeight: 500,
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (!isRegenerating) {
                e.currentTarget.style.background = 'rgba(0, 183, 195, 0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isRegenerating) {
                e.currentTarget.style.background = 'transparent';
              }
            }}
          >
            Save Only
          </button>
          
          <button
            onClick={handleSaveAndRegenerate}
            disabled={isRegenerating}
            style={{
              background: 'linear-gradient(135deg, #00B7C3, #0078D4)',
              color: '#fff',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: 8,
              cursor: isRegenerating ? 'wait' : 'pointer',
              opacity: isRegenerating ? 0.6 : 1,
              fontSize: 14,
              fontWeight: 500,
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (!isRegenerating) {
                e.currentTarget.style.opacity = '0.9';
              }
            }}
            onMouseLeave={(e) => {
              if (!isRegenerating) {
                e.currentTarget.style.opacity = '1';
              }
            }}
          >
            {isRegenerating ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ 
                  display: 'inline-block',
                  width: 14,
                  height: 14,
                  border: '2px solid transparent',
                  borderTopColor: '#fff',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite'
                }} />
                Regenerating Audio...
              </span>
            ) : (
              'Save & Regenerate Audio'
            )}
          </button>
        </div>
        
        {/* Add keyframe animation for spinner */}
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </motion.div>
    </motion.div>
  );
};