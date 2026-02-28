import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '@framework';

export interface TerminalPhase {
  type: 'input' | 'output';
  text: string;
  color?: string;
  prefix?: string;
}

interface LiveTerminalSimulationProps {
  phases: TerminalPhase[];
  activePhase: number;
}

const FONT_FAMILY = "'Cascadia Code', 'Fira Code', Consolas, monospace";

const TitleBar: React.FC = () => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '10px 14px',
      background: 'rgba(255,255,255,0.04)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
    }}
  >
    <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#f87171' }} />
    <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#fbbf24' }} />
    <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#34d399' }} />
    <span
      style={{
        marginLeft: 12,
        color: 'rgba(148,163,184,0.5)',
        fontSize: 12,
        fontFamily: FONT_FAMILY,
      }}
    >
      devui-debug-session
    </span>
  </div>
);

const PhaseRow: React.FC<{ phase: TerminalPhase; reduced: boolean }> = ({ phase, reduced }) => {
  if (phase.type === 'input') {
    return (
      <motion.div
        initial={reduced ? { opacity: 1 } : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        style={{
          fontFamily: FONT_FAMILY,
          fontSize: 13,
          lineHeight: '22px',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        <span style={{ color: '#34d399' }}>$ </span>
        <span style={{ color: '#e2e8f0' }}>{phase.text}</span>
      </motion.div>
    );
  }

  // output phase
  return (
    <motion.div
      initial={reduced ? { opacity: 1 } : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      style={{
        fontFamily: FONT_FAMILY,
        fontSize: 13,
        lineHeight: '22px',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}
    >
      {phase.prefix && (
        <span style={{ color: phase.color || 'rgba(148,163,184,0.8)' }}>
          {phase.prefix}{' '}
        </span>
      )}
      <span style={{ color: phase.color && !phase.prefix ? phase.color : 'rgba(203,213,225,0.85)' }}>
        {phase.text}
      </span>
    </motion.div>
  );
};

export const LiveTerminalSimulation: React.FC<LiveTerminalSimulationProps> = ({
  phases,
  activePhase,
}) => {
  const { reduced } = useReducedMotion();
  const scrollRef = useRef<HTMLDivElement>(null);

  const visiblePhases = phases.slice(0, activePhase + 1);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activePhase]);

  return (
    <div
      style={{
        background: '#0a0e17',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 10,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: 420,
      }}
    >
      <TitleBar />
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '14px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          scrollBehavior: 'smooth',
        }}
      >
        <AnimatePresence>
          {visiblePhases.map((phase, i) => (
            <PhaseRow key={i} phase={phase} reduced={reduced} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
