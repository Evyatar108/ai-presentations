import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme, useReducedMotion } from '@framework';

interface CandidateGridProps {
  n: number;
  animate?: boolean;
}

const CandidateGrid: React.FC<CandidateGridProps> = ({
  n,
  animate = true
}) => {
  const theme = useTheme();
  const { reduced } = useReducedMotion();
  const [visibleCount, setVisibleCount] = useState(reduced || !animate ? n * (n - 1) / 2 : 0);

  const totalCandidates = n * (n - 1) / 2;

  useEffect(() => {
    if (reduced || !animate) {
      setVisibleCount(totalCandidates);
      return;
    }

    let count = 0;
    const interval = setInterval(() => {
      count++;
      setVisibleCount(count);
      if (count >= totalCandidates) clearInterval(interval);
    }, 80);

    return () => clearInterval(interval);
  }, [animate, reduced, totalCandidates]);

  // Build upper-triangle cells
  const cells: { row: number; col: number; index: number }[] = [];
  let idx = 0;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      cells.push({ row: i, col: j, index: idx++ });
    }
  }

  const cellSize = Math.min(48, 280 / n);
  const gap = 3;

  return (
    <div style={{ textAlign: 'center' }}>
      {/* Grid */}
      <div style={{
        display: 'inline-grid',
        gridTemplateColumns: `repeat(${n}, ${cellSize}px)`,
        gridTemplateRows: `repeat(${n}, ${cellSize}px)`,
        gap,
        marginBottom: '1rem'
      }}>
        {Array.from({ length: n * n }, (_, flat) => {
          const row = Math.floor(flat / n);
          const col = flat % n;

          if (col <= row) {
            // Lower triangle + diagonal: empty/label
            return (
              <div
                key={flat}
                style={{
                  width: cellSize,
                  height: cellSize,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 10,
                  color: row === col ? theme.colors.textMuted : 'transparent',
                  borderRadius: 4
                }}
              >
                {row === col ? `u${row}` : ''}
              </div>
            );
          }

          // Upper triangle: candidate cell
          const cellData = cells.find(c => c.row === row && c.col === col);
          const isLit = cellData ? cellData.index < visibleCount : false;
          const progress = cellData ? cellData.index / totalCandidates : 0;

          // Gradient from warning (few) to error (many)
          const r = Math.round(251 + (239 - 251) * progress);
          const g = Math.round(191 + (68 - 191) * progress);
          const b = Math.round(36 + (68 - 36) * progress);

          return (
            <motion.div
              key={flat}
              initial={{ opacity: 0 }}
              animate={{ opacity: isLit ? 1 : 0.1 }}
              transition={{ duration: 0.15 }}
              style={{
                width: cellSize,
                height: cellSize,
                borderRadius: 4,
                background: isLit
                  ? `rgba(${r}, ${g}, ${b}, 0.7)`
                  : `rgba(255, 255, 255, 0.03)`,
                border: `1px solid ${isLit ? `rgba(${r}, ${g}, ${b}, 0.4)` : theme.colors.bgBorder}`
              }}
            />
          );
        })}
      </div>

      {/* Counter */}
      <div style={{
        fontSize: 16,
        fontWeight: 600,
        color: visibleCount >= totalCandidates ? theme.colors.error : theme.colors.warning,
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace"
      }}>
        Candidates: {visibleCount} / {totalCandidates}
      </div>
    </div>
  );
};

export default CandidateGrid;
