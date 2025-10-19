import React from 'react';
import { MetricTile } from './CoreComponents';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../accessibility/ReducedMotion';
import { SlideComponentWithMetadata } from '../slides/SlideMetadata';

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
 * Chapter 7, Utterance 3 - Cost Curve
 * Fixed Stacked Bar Comparison Only
 * Simplified to a single visualization focusing on component cost reduction.
 */
export const Ch7_S3_CostCurve: SlideComponentWithMetadata = () => {
  const { reduced } = useReducedMotion();
  // Relative component magnitudes (illustrative only)
  const v1 = { calls: 40, orchestration: 18, tokens: 22, gpuPadding: 20 };
  const v2 = { calls: 10, orchestration: 2, tokens: 12, gpuPadding: 8 };
  const savingsPct = 70;
  
  const hScale = 2.4;
  const barStyle: React.CSSProperties = {
    width: 140,
    borderRadius: 10,
    display:'flex',
    flexDirection:'column-reverse',
    overflow:'hidden',
    border:'1px solid #334155',
    background:'#0f172a'
  };
  
  const v1Segments = [
    { key:'calls', color:'#ef4444', h:v1.calls, label:'LLM Calls' },
    { key:'orch', color:'#f59e0b', h:v1.orchestration, label:'Orchestration' },
    { key:'tokens', color:'#6366f1', h:v1.tokens, label:'Tokens' },
    { key:'gpu', color:'#94a3b8', h:v1.gpuPadding, label:'GPU Padding' }
  ];
  const v2Segments = [
    { key:'calls', color:'#22c55e', h:v2.calls, label:'LLM Calls' },
    { key:'orch', color:'#10b981', h:v2.orchestration, label:'Orchestration' },
    { key:'tokens', color:'#0ea5e9', h:v2.tokens, label:'Tokens' },
    { key:'gpu', color:'#64748b', h:v2.gpuPadding, label:'GPU Padding' }
  ];
  
  const StackedBars: React.FC = () => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: reduced ? 0.2 : 0.3 }}
        style={{display:'flex', gap:'4rem', justifyContent:'center', alignItems:'flex-end', marginTop:'2rem', height: 250}}
      >
        {/* V1 */}
        <motion.div style={{textAlign:'center'}}>
          <motion.div style={barStyle}>
            {v1Segments.map((seg, idx) => (
              <motion.div
                key={seg.key}
                title={seg.label}
                initial={{ height: 0 }}
                animate={{ height: seg.h * hScale }}
                exit={{ height: 0 }}
                transition={{
                  duration: reduced ? 0.2 : 0.4,
                  delay: reduced ? 0 : idx * 0.05,
                  ease: 'easeOut'
                }}
                style={{ background: seg.color }}
              />
            ))}
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: reduced ? 0 : 0.7 }}
            style={{color:'#94a3b8', fontSize:12, marginTop:6}}
          >
            V1 Total
          </motion.div>
        </motion.div>
        {/* V2 */}
        <motion.div style={{textAlign:'center'}}>
          <motion.div style={barStyle}>
            {v2Segments.map((seg, idx) => (
              <motion.div
                key={seg.key}
                title={seg.label}
                initial={{ height: 0 }}
                animate={{ height: seg.h * hScale }}
                exit={{ height: 0 }}
                transition={{
                  duration: reduced ? 0.2 : 0.4,
                  delay: reduced ? 0 : idx * 0.05,
                  ease: 'easeOut'
                }}
                style={{ background: seg.color }}
              />
            ))}
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: reduced ? 0 : 0.7 }}
            style={{color:'#94a3b8', fontSize:12, marginTop:6}}
          >
            Unified V2
          </motion.div>
        </motion.div>
      </motion.div>
    );
  };
  
  const commonTileRow = (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduced ? 0.2 : 0.5, delay: reduced ? 0 : 1 }}
      style={{
        display:'flex',
        gap:'0.75rem',
        marginTop:'1.5rem',
        flexWrap:'wrap',
        justifyContent:'center',
        alignItems:'stretch'
      }}
    >
      <MetricTile label="LLM Calls" before="4" after="1" emphasis note="Call collapse" />
      <div style={{fontSize:28, color:'#94a3b8', display:'flex', alignItems:'center'}}>+</div>
      <MetricTile label="Transcript Format" before="Verbose" after="Compact" note="Schema redesign" />
      <div style={{fontSize:28, color:'#94a3b8', display:'flex', alignItems:'center'}}>+</div>
      <MetricTile label="Extractive Input" before="Candidates" after="Direct" note="Model selects ranges" />
      <div style={{fontSize:28, color:'#94a3b8', display:'flex', alignItems:'center'}}>=</div>
      <MetricTile label="GPU Capacity" before="~600" after="~200" emphasis note="Resulting capacity" />
    </motion.div>
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
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: reduced ? 0.2 : 0.6 }}
        style={{
          color:'#f1f5f9',
          border:'1px solid #334155',
          borderRadius:16,
          padding:'1.5rem',
          maxWidth:1000,
          width: '100%'
        }}
      >
        <motion.h2
          initial={{ y: -12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: reduced ? 0.2 : 0.5 }}
          style={{marginTop:0}}
        >
          COGS Impact: Multi-Call vs Unified Prompt
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: reduced ? 0 : 0.3, duration: reduced ? 0.2 : 0.5 }}
          style={{fontSize:14, lineHeight:1.5, opacity:0.85}}
        >
          Unified prompt consolidation combines three major levers (call reduction, compact transcript format, direct extractive range selection) yielding a {savingsPct}%+ variable cost reduction and enabling GPU capacity drop (~600→~200).
        </motion.p>
  <div style={{ minHeight: 120 }}>
    <StackedBars />
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ delay: reduced ? 0 : 0.9, duration: 0.4 }}
      style={{marginTop:'1.5rem', textAlign:'center', fontSize:16, color:'#94a3b8'}}
    >
      Estimated Cost Reduction:{' '}
      <motion.span
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: reduced ? 0 : 1.1, type:'spring', duration:0.6 }}
        style={{color:'#22c55e', fontWeight:600}}
      >
        {savingsPct}%+
      </motion.span>
    </motion.div>
  </div>

  
        {commonTileRow}
      </motion.div>
    </div>
  );
};

Ch7_S3_CostCurve.metadata = {
  chapter: 7,
  utterance: 3,
  title: "Cost Savings",
  audioSegments: [{ id: "main", audioFilePath: "/audio/12-Audio 12.wav" }]
};

/**
 * Chapter 7, Utterance 4 - Quality Comparison
 * Animated qualitative preference shift toward unified prompt outputs.
 */
export const Ch7_S4_QualityComparison: SlideComponentWithMetadata = () => {
  const { reduced } = useReducedMotion();
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: reduced ? 0 : 0.12,
        delayChildren: reduced ? 0 : 0.25
      }
    }
  };
  const fadeUp = {
    hidden: { opacity: 0, y: reduced ? 0 : 12 },
    visible: { opacity: 1, y: 0, transition: { duration: reduced ? 0.2 : 0.5 } }
  };
  const tileVariants = {
    hidden: { opacity: 0, scale: reduced ? 1 : 0.85 },
    visible: { opacity: 1, scale: 1, transition: { duration: reduced ? 0.25 : 0.6 } }
  };
  
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
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{
          color:'#f1f5f9',
          border:'1px solid #334155',
          borderRadius:16,
          padding:'1.5rem',
          maxWidth:900,
          width: '100%'
        }}
      >
        <motion.h2 variants={fadeUp} style={{marginTop:0}}>
          Quality Shift: Unified Prompt Preference
        </motion.h2>
        <motion.p
          variants={fadeUp}
          style={{fontSize:14, lineHeight:1.5, opacity:0.85}}
        >
          Early internal feedback strongly prefers unified prompt highlight videos over the multi-call pipeline output. Gains center on depth and natural flow.
        </motion.p>
        
        <motion.div
          variants={fadeUp}
          style={{display:'flex', gap:'1rem', flexWrap:'wrap', marginTop:'1rem', justifyContent:'center'}}
          aria-label="Unified prompt quality improvements"
        >
          <motion.div variants={tileVariants}>
            <MetricTile label="Detail Level" before="Surface/Generic" after="Detailed" />
          </motion.div>
          <motion.div variants={tileVariants}>
            <MetricTile label="Redundancy" before="Higher" after="Lower" />
          </motion.div>
          <motion.div variants={tileVariants}>
            <MetricTile label="Narrative Style" before="Plain/Robotic" after="Natural/Flowing" />
          </motion.div>
          
          <motion.div
            variants={tileVariants}
            initial={{ opacity: 0, scale: reduced ? 1 : 0.9 }}
            animate={reduced ? {} : { opacity: 1, scale: 1 }}
            style={{
              background: 'linear-gradient(135deg, #00B7C3, #0078D4)',
              borderRadius: 12,
              padding: '1rem',
              minWidth: 180,
              textAlign: 'center',
              boxShadow: reduced ? 'none' : '0 4px 12px rgba(0, 183, 195, 0.3)',
              position:'relative'
            }}
            aria-label="Internal reviewers strongly prefer unified prompt output"
          >
            <motion.div
              style={{ position:'absolute', inset:0, borderRadius:12 }}
              initial={{ opacity:0 }}
              animate={reduced ? {} : { opacity:[0.15,0.35,0.15] }}
              transition={{ duration:2.5, repeat:Infinity }}
            />
            <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: '0.5rem' }}>
              Internal Reviewers
            </div>
            <motion.div
              initial={{ scale: reduced ? 1 : 0.92 }}
              animate={reduced ? {} : { scale: [1, 1.12, 1], opacity: [1, 1, 1] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                fontSize: 24,
                fontWeight: 'bold',
                color: '#fff',
                display: 'inline-block',
                willChange: 'transform',
                transformOrigin: 'center center'
              }}
            >
              Strongly Prefer
            </motion.div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.9)', marginTop: '0.5rem' }}>
              Unified Prompt Output
            </div>
          </motion.div>
        </motion.div>
        
        <motion.div
          variants={fadeUp}
          style={{marginTop:'1.5rem', textAlign:'center', fontSize:12, opacity:0.55}}
        >
          The unified prompt improved cohesion, detail depth, and reduced redundancy based on initial feedback.
        </motion.div>
      </motion.div>
    </div>
  );
};

Ch7_S4_QualityComparison.metadata = {
  chapter: 7,
  utterance: 4,
  title: "Quality Improvement",
  audioSegments: [{ id: "main", audioFilePath: "/audio/13-Audio 13.wav" }]
};

/* RoadmapSlide removed per user request: animations complete; slide omitted. */

/**
 * Group export.
 */
export const ImpactComponents = {
  GPUReduction,
  Ch7_S3_CostCurve,
  Ch7_S4_QualityComparison
};