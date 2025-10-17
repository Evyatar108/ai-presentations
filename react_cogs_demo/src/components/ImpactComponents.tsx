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
 * CostCurve
 * Simple visual placeholder (SVG) for cost trend before vs after consolidation.
 * Replace later with animated Framer Motion sequence.
 */
export const CostCurve: React.FC = () => {
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
        maxWidth:900,
        width: '100%'
      }}>
      <h2 style={{marginTop:0}}>COGS Impact: Multi-Call vs Unified Prompt</h2>
      <p style={{fontSize:13, opacity:0.75}}>
        Consolidation reduces per-session variable cost by removing orchestration overhead,
        excess token allocation, and eliminating multiple LLM invocations.
      </p>
      <svg width="100%" height="180" viewBox="0 0 600 180">
        <defs>
          <linearGradient id="gradA" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.7" />
          </linearGradient>
          <linearGradient id="gradB" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.7" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="600" height="180" fill="#0f172a" />
        {/* V1 curve (higher) */}
        <path
          d="M20 140 C120 110, 220 100, 320 90 C420 80, 520 70, 580 60"
          fill="none"
          stroke="url(#gradA)"
          strokeWidth="4"
          strokeLinecap="round"
        />
        {/* V2 curve (lower) */}
        <path
          d="M20 150 C120 130, 220 120, 320 115 C420 110, 520 105, 580 100"
          fill="none"
          stroke="url(#gradB)"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <text x="28" y="55" fontSize="12" fill="#f1f5f9">V1 (4 calls)</text>
        <text x="28" y="95" fontSize="12" fill="#f1f5f9">V2 (1 unified)</text>
      </svg>
      <div style={{display:'flex', gap:'1rem', marginTop:'0.75rem', flexWrap:'wrap'}}>
        <MetricTile label="LLM Calls" before="4" after="1" emphasis />
        <MetricTile label="Orchestration" before="Complex" after="Simple" note="Single invocation" />
        <MetricTile label="Failure Surface" before="4 pts" after="1 pt" note="Simpler retries" />
        <MetricTile label="Token Overhead" before="Higher" after="Lower" note="Fused processing" />
      </div>
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
      <div style={{display:'flex', gap:'1rem', flexWrap:'wrap', marginTop:'1rem'}}>
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