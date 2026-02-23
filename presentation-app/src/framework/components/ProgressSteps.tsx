import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../theme/ThemeContext';
import { useReducedMotion } from '../accessibility/ReducedMotion';
import { useMarker } from '../hooks/useMarker';

export interface ProgressStep {
  label: string;
  icon?: string;
  status: 'completed' | 'active' | 'pending';
}

export interface ProgressStepsProps {
  steps: ProgressStep[];
  /** Connector style between steps (default: 'arrow') */
  connectorStyle?: 'arrow' | 'line' | 'dashed';
  /** Optional marker ID; when set, steps activate progressively as markers are reached */
  activeStep?: string;
}

/**
 * Individual step that optionally reads its own marker state.
 */
const StepBox: React.FC<{
  step: ProgressStep;
  index: number;
  marker?: string;
  theme: ReturnType<typeof useTheme>;
  reduced: boolean;
}> = ({ step, index, marker, theme, reduced }) => {
  const { reached } = useMarker(marker ?? '');

  // When marker-driven, override status based on reached state
  const effectiveStatus = marker
    ? (reached ? (step.status === 'active' ? 'active' : 'completed') : 'pending')
    : step.status;

  const isActive = effectiveStatus === 'active';
  const isCompleted = effectiveStatus === 'completed';
  const isPending = effectiveStatus === 'pending';

  return (
    <motion.div
      initial={{ opacity: 0, y: reduced ? 0 : 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduced ? 0.1 : 0.3, delay: reduced ? 0 : index * 0.1 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.75rem 1.25rem',
        borderRadius: 12,
        background: isActive
          ? `linear-gradient(135deg, rgba(0, 183, 195, 0.15), rgba(0, 120, 212, 0.15))`
          : theme.colors.bgSurface,
        border: isActive
          ? `2px solid ${theme.colors.primary}`
          : `1px solid ${theme.colors.bgBorder}`,
        boxShadow: isActive
          ? `0 0 16px rgba(0, 183, 195, 0.25)`
          : 'none',
        opacity: isPending ? 0.4 : isCompleted ? 0.7 : 1,
        transition: 'opacity 0.4s ease, border-color 0.3s ease, box-shadow 0.3s ease',
        position: 'relative' as const,
        minWidth: 120,
      }}
    >
      {step.icon && (
        <div style={{ fontSize: 24, lineHeight: 1 }}>
          {step.icon}
        </div>
      )}
      <div style={{
        fontSize: 14,
        fontWeight: 600,
        color: isActive ? theme.colors.primary : theme.colors.textPrimary,
        textAlign: 'center',
      }}>
        {step.label}
      </div>
      {isCompleted && (
        <div style={{
          position: 'absolute',
          top: -6,
          right: -6,
          width: 20,
          height: 20,
          borderRadius: '50%',
          background: theme.colors.success,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 11,
          color: '#fff',
          fontWeight: 700,
        }}>
          &#10003;
        </div>
      )}
    </motion.div>
  );
};

const Connector: React.FC<{
  style: 'arrow' | 'line' | 'dashed';
  theme: ReturnType<typeof useTheme>;
}> = ({ style, theme }) => {
  if (style === 'arrow') {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        color: theme.colors.textMuted,
        fontSize: 20,
      }}>
        &#8594;
      </div>
    );
  }

  return (
    <div style={{
      flex: '0 0 32px',
      height: 2,
      background: theme.colors.bgBorder,
      borderStyle: style === 'dashed' ? 'dashed' : 'solid',
      alignSelf: 'center',
    }} />
  );
};

/**
 * Horizontal step indicator with completed/active/pending states.
 *
 * @example
 * ```tsx
 * <ProgressSteps
 *   steps={[
 *     { label: 'Cost Reduction', icon: '\uD83D\uDCB0', status: 'completed' },
 *     { label: 'Private Preview', icon: '\uD83D\uDD12', status: 'active' },
 *     { label: 'GA Rollout', icon: '\uD83D\uDE80', status: 'pending' },
 *   ]}
 *   connectorStyle="arrow"
 * />
 * ```
 */
export const ProgressSteps: React.FC<ProgressStepsProps> = ({
  steps,
  connectorStyle = 'arrow',
}) => {
  const theme = useTheme();
  const { reduced } = useReducedMotion();

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.75rem',
    }}>
      {steps.map((step, i) => (
        <React.Fragment key={step.label}>
          {i > 0 && <Connector style={connectorStyle} theme={theme} />}
          <StepBox
            step={step}
            index={i}
            theme={theme}
            reduced={reduced}
          />
        </React.Fragment>
      ))}
    </div>
  );
};
