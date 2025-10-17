import React from 'react';

/**
 * MetricTile
 * Simple tile for displaying a key metric (e.g., Calls 4→1, GPUs ~600→~200).
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
  return (
    <div style={{
      border: '1px solid #1e293b',
      borderRadius: 12,
      padding: '1rem',
      background: emphasis ? 'linear-gradient(135deg,#0f172a,#1e293b)' : '#0f172a',
      color: '#f1f5f9',
      minWidth: 180,
      fontFamily: 'Inter, system-ui, sans-serif',
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
        {before && after && <span style={{fontSize:16, opacity:0.5}}>→</span>}
        {after && <span style={{fontSize:20, fontWeight:600}}>{after}</span>}
      </div>
      {note && <div style={{fontSize:11, marginTop:6, opacity:0.6}}>{note}</div>}
    </div>
  );
};

/**
 * PipelineComparison
 * Shows the 4-step V1 pipeline vs unified V2 prompt.
 */
export const PipelineComparison: React.FC = () => {
  const boxStyle: React.CSSProperties = {
    flex: 1,
    border: '1px solid #334155',
    borderRadius: 12,
    padding: '1rem',
    background: '#0f172a'
  };
  const heading: React.CSSProperties = {marginTop:0, fontSize:16};
  return (
    <div style={{
      display:'flex',
      gap:'1.5rem',
      fontFamily:'Inter, system-ui, sans-serif',
      color:'#f1f5f9'
    }}>
      <div style={boxStyle}>
        <h3 style={heading}>V1: 4 Sequential Calls</h3>
        <ol style={{paddingLeft:'1.2rem', fontSize:14, lineHeight:1.4}}>
          <li>Topic abstraction</li>
          <li>Extractive selection</li>
          <li>Ranking & pruning</li>
          <li>Narrative synthesis</li>
        </ol>
        <p style={{fontSize:12, opacity:0.7}}>
          Each step triggers a separate LLM invocation with orchestration + token overhead.
        </p>
      </div>
      <div style={boxStyle}>
        <h3 style={heading}>V2: Unified Single Prompt</h3>
        <ul style={{paddingLeft:'1.2rem', fontSize:14, lineHeight:1.4}}>
          <li>Combines all semantic transforms</li>
          <li>Structured output schema</li>
          <li>Minimizes latency + error surface</li>
          <li>Removes intermediate JSON stitching</li>
        </ul>
        <p style={{fontSize:12, opacity:0.7}}>
          Result: Calls 4→1, GPUs ~600→~200, better narrative cohesion.
        </p>
      </div>
    </div>
  );
};

/**
 * UnifiedPromptConvergence
 * Illustrates merging of four functional blocks into one prompt.
 */
export const UnifiedPromptConvergence: React.FC = () => {
  const blockStyle: React.CSSProperties = {
    flex:1,
    background:'#1e293b',
    borderRadius:8,
    padding:'0.75rem',
    fontSize:12,
    lineHeight:1.3
  };
  return (
    <div style={{
      fontFamily:'Inter, system-ui, sans-serif',
      color:'#f1f5f9',
      display:'flex',
      flexDirection:'column',
      gap:'1rem'
    }}>
      <h3 style={{margin:0}}>Convergence: 4 Functional Blocks → 1 Structured Prompt</h3>
      <div style={{display:'flex', gap:'0.75rem'}}>
        <div style={blockStyle}>
          <strong>Topics</strong><br/>
          Abstract salient thematic clusters.
        </div>
        <div style={blockStyle}>
          <strong>Extraction</strong><br/>
          Pull representative utterances.
        </div>
        <div style={blockStyle}>
          <strong>Ranking</strong><br/>
          Score, dedupe, prune low-signal items.
        </div>
        <div style={blockStyle}>
          <strong>Narrative</strong><br/>
          Compose cohesive highlight storyline.
        </div>
      </div>
      <div style={{
        alignSelf:'center',
        fontSize:24,
        fontWeight:600,
        letterSpacing:1,
        background:'linear-gradient(90deg,#38bdf8,#818cf8)',
        WebkitBackgroundClip:'text',
        color:'transparent'
      }}>
        ↓ Single Prompt Fusion ↓
      </div>
      <div style={{
        border:'1px solid #334155',
        borderRadius:12,
        padding:'1rem',
        background:'#0f172a',
        fontSize:13
      }}>
        <strong>Unified Prompt</strong>: Accepts transcript with lightweight structural hints, emits
        structured JSON containing topics, representative spans, ranked highlight set, and narrative synthesis
        in one pass. Removes orchestration latency, collapses token overhead, simplifies retry logic.
      </div>
      <div style={{display:'flex', gap:'1rem', marginTop:'0.5rem', flexWrap:'wrap'}}>
        <MetricTile label="LLM Calls" before="4" after="1" emphasis />
        <MetricTile label="Estimated GPUs" before="~600" after="~200" emphasis note="Capacity plan delta" />
        <MetricTile label="Latency / session" before="High" after="Lower" note="Fewer round trips" />
        <MetricTile label="Quality" before="Baseline" after="Preferred" note="Early reviewer preference" />
      </div>
    </div>
  );
};

/**
 * Export grouped for convenience.
 */
export const CoreComponents = {
  MetricTile,
  PipelineComparison,
  UnifiedPromptConvergence
};