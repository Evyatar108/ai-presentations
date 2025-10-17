import React from 'react';
import { MetricTile } from './CoreComponents';

/**
 * GPUReduction
 * Highlights reduction in required GPU capacity from planning estimate ~600 to ~200
 * due to collapsing 4 sequential LLM calls into a single unified prompt.
 */
export const GPUReduction: React.FC = () => {
  return (
    <div style={{
      background: '#0f172a',
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{
        color:'#f1f5f9',
        border:'1px solid #334155',
        borderRadius:16,
        padding:'1.5rem',
        maxWidth:900,
        width: '100%'
      }}>
      <h2 style={{marginTop:0}}>Capacity Impact: GPUs ~600 → ~200</h2>
      <p style={{fontSize:14, lineHeight:1.5, opacity:0.85}}>
        The V1 design required four distinct LLM calls per highlight generation session:
        topic abstraction, extractive selection, ranking & pruning, and narrative synthesis.
        Each call demanded concurrency headroom, retry buffers, and token padding, inflating
        peak GPU reservation estimates to approximately 600.
      </p>
      <p style={{fontSize:14, lineHeight:1.5, opacity:0.85}}>
        The unified V2 prompt executes all semantic transforms in a single pass. This removes
        three orchestration turnarounds, collapses intermediate JSON assembly, and reduces total
        token volume. Aggregate effect: projected GPU requirement drops to roughly 200 while
        improving output cohesion.
      </p>
      <div style={{display:'flex', gap:'1rem', flexWrap:'wrap', marginTop:'1rem'}}>
        <MetricTile label="LLM Calls" before="4" after="1" emphasis note="Pipeline collapse" />
        <MetricTile label="Peak GPUs" before="~600" after="~200" emphasis note="Capacity plan" />
        <MetricTile label="Retries Surface" before="4x" after="1x" note="Lower failure modes" />
        <MetricTile label="Token Overhead" before="Multi-pass" after="Single-pass" note="Fused transforms" />
      </div>
      <ul style={{fontSize:13, lineHeight:1.4, marginTop:'1.25rem'}}>
        <li>Eliminated inter-call latency padding</li>
        <li>Reduced concurrency slots per session</li>
        <li>Simplified backoff / retry orchestration logic</li>
        <li>Lower transient memory footprint</li>
      </ul>
      </div>
    </div>
  );
};

/**
 * CostCurve (Slide 30) - Fixed Stacked Bar Comparison Only
 * Simplified to a single visualization focusing on component cost reduction.
 */
export const CostCurve: React.FC = () => {
  // Relative component magnitudes (illustrative only)
  const v1 = { calls: 40, orchestration: 18, tokens: 22, gpuPadding: 20 };
  const v2 = { calls: 10, orchestration: 2, tokens: 12, gpuPadding: 8 };

  const totalV1 = Object.values(v1).reduce((a,b)=>a+b,0);
  const totalV2 = Object.values(v2).reduce((a,b)=>a+b,0);
  const savingsPct = 70;

  const StackedBars: React.FC = () => {
    const hScale = 3.2;
    const barStyle: React.CSSProperties = {
      width: 140,
      borderRadius: 10,
      display:'flex',
      flexDirection:'column-reverse',
      overflow:'hidden',
      border:'1px solid #334155',
      background:'#0f172a'
    };
    const seg = (color:string, h:number): React.CSSProperties => ({
      background: color,
      height: h * hScale,
      transition:'height 0.6s'
    });
    return (
      <div style={{display:'flex', gap:'4rem', justifyContent:'center', alignItems:'flex-end', marginTop:'1rem'}}>
        <div style={{textAlign:'center'}}>
          <div style={barStyle}>
            <div style={seg('#ef4444', v1.calls)} title="LLM Calls" />
            <div style={seg('#f59e0b', v1.orchestration)} title="Orchestration" />
            <div style={seg('#6366f1', v1.tokens)} title="Tokens" />
            <div style={seg('#94a3b8', v1.gpuPadding)} title="GPU Padding" />
          </div>
          <div style={{color:'#94a3b8', fontSize:12, marginTop:6}}>V1 Total</div>
        </div>
        <div style={{textAlign:'center'}}>
          <div style={barStyle}>
            <div style={seg('#22c55e', v2.calls)} title="LLM Calls" />
            <div style={seg('#10b981', v2.orchestration)} title="Orchestration" />
            <div style={seg('#0ea5e9', v2.tokens)} title="Tokens" />
            <div style={seg('#64748b', v2.gpuPadding)} title="GPU Padding" />
          </div>
          <div style={{color:'#94a3b8', fontSize:12, marginTop:6}}>Unified V2</div>
        </div>
      </div>
    );
  };

  const commonTileRow = (
    <div style={{
      display:'flex',
      gap:'0.75rem',
      marginTop:'1.5rem',
      flexWrap:'wrap',
      justifyContent:'center',
      alignItems:'stretch'
    }}>
      <MetricTile label="LLM Calls" before="4" after="1" emphasis note="Call collapse" />
      <div style={{fontSize:28, color:'#94a3b8', display:'flex', alignItems:'center'}}>+</div>
      <MetricTile label="Transcript Format" before="Verbose" after="Compact" note="Schema redesign" />
      <div style={{fontSize:28, color:'#94a3b8', display:'flex', alignItems:'center'}}>+</div>
      <MetricTile label="Extractive Input" before="Candidates" after="Direct" note="Model selects ranges" />
      <div style={{fontSize:28, color:'#94a3b8', display:'flex', alignItems:'center'}}>=</div>
      <MetricTile label="GPU Capacity" before="~600" after="~200" emphasis note="Resulting capacity" />
    </div>
  );

  return (
    <div style={{
      background: '#0f172a',
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{
        color:'#f1f5f9',
        border:'1px solid #334155',
        borderRadius:16,
        padding:'1.5rem',
        maxWidth:1000,
        width: '100%'
      }}>
        <h2 style={{marginTop:0}}>COGS Impact: Multi-Call vs Unified Prompt</h2>
        <p style={{fontSize:14, lineHeight:1.5, opacity:0.85}}>
          Unified prompt consolidation combines three major levers (call reduction, compact transcript format, direct extractive range selection) yielding a {savingsPct}%+ variable cost reduction and enabling GPU capacity drop (~600→~200).
        </p>

        <StackedBars />

        <div style={{marginTop:'1.5rem', textAlign:'center', fontSize:16, color:'#94a3b8'}}>
          Estimated Cost Reduction: <span style={{color:'#22c55e', fontWeight:600}}>{savingsPct}%+</span>
        </div>

        {commonTileRow}
      </div>
    </div>
  );
};

/**
 * QualityComparison
 * Summarizes qualitative preference shift toward unified prompt outputs.
 */
export const QualityComparison: React.FC = () => {
  return (
    <div style={{
      background: '#0f172a',
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{
        color:'#f1f5f9',
        border:'1px solid #334155',
        borderRadius:16,
        padding:'1.5rem',
        maxWidth:900,
        width: '100%'
      }}>
      <h2 style={{marginTop:0}}>Quality Shift: Unified Prompt Preference</h2>
      <p style={{fontSize:14, lineHeight:1.5, opacity:0.85}}>
        Early internal feedback strongly prefers unified prompt highlight videos over
        the multi-call pipeline output. Gains center on depth and natural flow.
      </p>
      <div style={{display:'flex', gap:'1rem', flexWrap:'wrap', marginTop:'1rem', justifyContent:'center'}}>
        <MetricTile label="Detail Level" before="Surface/Generic" after="Detailed" />
        <MetricTile label="Redundancy" before="Higher" after="Lower" />
        <MetricTile label="Narrative Style" before="Plain/Robotic" after="Natural/Flowing" />
        <div style={{
          background: 'linear-gradient(135deg, #00B7C3, #0078D4)',
          borderRadius: 12,
          padding: '1rem',
          minWidth: 180,
          textAlign: 'center',
          boxShadow: '0 4px 12px rgba(0, 183, 195, 0.3)'
        }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: '0.5rem' }}>
            Internal Reviewers
          </div>
          <div style={{ fontSize: 24, fontWeight: 'bold', color: '#fff' }}>
            Strongly Prefer
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.9)', marginTop: '0.5rem' }}>
            Unified Prompt Output
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

/**
 * RoadmapSlide
 * Extended roadmap including remaining animation & accessibility tasks.
 */
export const RoadmapSlide: React.FC = () => {
  return (
    <div style={{
      background: '#0f172a',
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{
        color:'#f1f5f9',
        border:'1px solid #334155',
        borderRadius:16,
        padding:'1.25rem',
        maxWidth:800,
        width: '100%'
      }}>
      <h2 style={{marginTop:0}}>Roadmap</h2>
      <ol style={{fontSize:14, lineHeight:1.5, paddingLeft:'1.2rem'}}>
        <li>Replace static placeholders with Framer Motion variants</li>
        <li>GPU rack visualization + token bar animation</li>
        <li>Integrate transcript excerpt overlays</li>
        <li>Reduced-motion accessibility mode</li>
        <li>Alt text / semantic roles for visuals</li>
        <li>Remotion export scaffold (optional video generation)</li>
        <li>Performance polish & memoization for heavy slides</li>
      </ol>
      <p style={{fontSize:12, opacity:0.7}}>
        Focus remains on clarity of key message: LLM calls 4→1, GPUs ~600→~200, quality uplift.
      </p>
      </div>
    </div>
  );
};

/**
 * Group export.
 */
export const ImpactComponents = {
  GPUReduction,
  CostCurve,
  QualityComparison,
  RoadmapSlide
};