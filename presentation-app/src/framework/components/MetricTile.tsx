import React from 'react';
import { useTheme } from '../theme/ThemeContext';

/**
 * MetricTile
 * Simple tile for displaying a key metric (e.g., Calls 4->1, GPUs ~600->~200).
 */
export interface MetricTileProps {
  label: string;
  before?: string;
  after?: string;
  emphasis?: boolean;
  note?: string;
}

export const MetricTile: React.FC<MetricTileProps> = ({
  label,
  before,
  after,
  emphasis,
  note
}) => {
  const theme = useTheme();
  return (
    <div style={{
      border: `1px solid ${theme.colors.bgSurface}`,
      borderRadius: 12,
      padding: '1rem',
      background: emphasis ? `linear-gradient(135deg,${theme.colors.bgDeep},${theme.colors.bgSurface})` : theme.colors.bgDeep,
      color: theme.colors.textPrimary,
      minWidth: 180,
      fontFamily: theme.fontFamily,
      textAlign: 'center'
    }}>
      <div style={{fontSize:12, letterSpacing:1, textTransform:'uppercase', opacity:0.7}}>{label}</div>
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 4
      }}>
        {before && <span style={{fontSize:14, opacity:0.7, textDecoration:'line-through'}}>{before}</span>}
        {before && after && <span style={{fontSize:16, opacity:0.5}}>-&gt;</span>}
        {after && <span style={{fontSize:20, fontWeight:600}}>{after}</span>}
      </div>
      {note && <div style={{fontSize:11, marginTop:6, opacity:0.6}}>{note}</div>}
    </div>
  );
};
