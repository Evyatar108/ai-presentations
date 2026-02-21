import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme, useReducedMotion } from '@framework';

interface CandidateGridProps {
  n: number;
  animate?: boolean;
  /** Topic ranges — only pairs within the same range become candidates. */
  topicRanges?: [number, number][];
  /** Hide the last diagonal label (useful when the last u has no candidates to its right). */
  hideLastLabel?: boolean;
}

const CandidateGrid: React.FC<CandidateGridProps> = ({
  n,
  animate = true,
  topicRanges,
  hideLastLabel = false,
}) => {
  const theme = useTheme();
  const { reduced } = useReducedMotion();

  // Build candidate cells — only pairs within a topic range (or full triangle if no ranges)
  const cells = useMemo(() => {
    const isCandidate = (row: number, col: number) => {
      if (!topicRanges) return true;
      return topicRanges.some(([start, end]) => row >= start && col <= end);
    };

    const result: { row: number; col: number; index: number }[] = [];
    let idx = 0;
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        if (isCandidate(i, j)) {
          result.push({ row: i, col: j, index: idx++ });
        }
      }
    }
    return result;
  }, [n, topicRanges]);

  const totalCandidates = cells.length;
  const [visibleCount, setVisibleCount] = useState(reduced || !animate ? totalCandidates : 0);

  useEffect(() => {
    if (reduced || !animate) {
      setVisibleCount(totalCandidates);
      return;
    }

    let count = 0;
    const step = Math.max(1, Math.floor(totalCandidates / 80));
    const interval = setInterval(() => {
      count += step;
      if (count >= totalCandidates) {
        setVisibleCount(totalCandidates);
        clearInterval(interval);
      } else {
        setVisibleCount(count);
      }
    }, 20);

    return () => clearInterval(interval);
  }, [animate, reduced, totalCandidates]);

  const cellSize = Math.min(48, 280 / n);
  const gap = 3;

  // Set of active cells for O(1) lookup
  const activeCells = useMemo(() => {
    const set = new Set<string>();
    for (const c of cells) set.add(`${c.row},${c.col}`);
    return set;
  }, [cells]);

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
                  justifyContent: 'flex-end',
                  paddingRight: 2,
                  fontSize: Math.min(10, cellSize * 0.8),
                  color: row === col ? theme.colors.textMuted : 'transparent',
                  borderRadius: 4
                }}
              >
                {row === col && !(hideLastLabel && row === n - 1) ? `u${row}` : ''}
              </div>
            );
          }

          // Upper triangle: candidate cell (only if in a topic range)
          const isActive = activeCells.has(`${row},${col}`);
          const cellData = isActive ? cells.find(c => c.row === row && c.col === col) : undefined;
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
              animate={{ opacity: isActive ? (isLit ? 1 : 0.1) : 0 }}
              transition={{ duration: 0.15 }}
              style={{
                width: cellSize,
                height: cellSize,
                borderRadius: 4,
                background: isLit
                  ? `rgba(${r}, ${g}, ${b}, 0.7)`
                  : isActive
                    ? `rgba(255, 255, 255, 0.03)`
                    : 'transparent',
                border: isActive
                  ? `1px solid ${isLit ? `rgba(${r}, ${g}, ${b}, 0.4)` : theme.colors.bgBorder}`
                  : '1px solid transparent',
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
