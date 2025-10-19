import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '../accessibility/ReducedMotion';
import { useSegmentedAnimation } from '../contexts/SegmentContext';
import { MetricTile } from '../components/CoreComponents';
import { VideoPlayer } from '../components/VideoPlayer';
import { SlideComponentWithMetadata } from './SlideMetadata';

/**
 * ALL SLIDE COMPONENTS FOR MEETING HIGHLIGHTS PRESENTATION
 * Consolidated from AnimatedSlides.tsx, ImpactComponents.tsx, and TeamCollaborationSlide.tsx
 */

/**
 /**
  * Blank Intro Slide
  * Simple dark screen to start narration cleanly
  */
 export const BlankIntro: SlideComponentWithMetadata = () => {
   return (
    <div style={{
      background: '#0f172a',
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {/* Empty slide - just dark background */}
      </motion.div>
    </div>
  );
};

BlankIntro.metadata = {
  chapter: 0,
  slide: 0,
  title: "Intro",
  audioSegments: [{ id: "main", audioFilePath: "/audio/c0/s0_segment_01_main.wav" }]
};

/**
 * Chapter 5, Utterance 1 - Challenge Framing
 * BEFORE metrics → TARGET unified approach
 */
export const Ch5_S1_ChallengeFraming: SlideComponentWithMetadata = () => {
  const { reduced } = useReducedMotion();
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: reduced ? 0 : 0.15,
        delayChildren: reduced ? 0 : 0.2
      }
    }
  };

  const tileVariants = {
    hidden: { opacity: 0, y: reduced ? 0 : -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: reduced ? 0.2 : 0.4 }
    }
  };

  const arrowVariants = {
    hidden: { scaleY: 0, opacity: 0 },
    visible: {
      scaleY: 1,
      opacity: 1,
      transition: { duration: reduced ? 0.2 : 0.5, delay: reduced ? 0 : 0.6 }
    }
  };

  const targetVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { duration: reduced ? 0.2 : 0.6, delay: reduced ? 0 : 1 }
    }
  };

  return (
    <div style={{
      background: '#0f172a',
      minHeight: '100vh',
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
        style={{ maxWidth: 900, width: '100%' }}
      >
        <h1 style={{ color: '#f1f5f9', marginBottom: '2rem', textAlign: 'center' }}>
          Meeting Highlights Cost Optimization
        </h1>
        
        <motion.div
          style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '2rem' }}
        >
          <motion.div variants={tileVariants}>
            <MetricTile label="LLM Calls" after="4" note="Sequential pipeline" />
          </motion.div>
          <motion.div variants={tileVariants}>
            <MetricTile label="Projected GPUs" after="~600" note="High capacity" />
          </motion.div>
          <motion.div variants={tileVariants}>
            <MetricTile label="Input Tokens" after="High" note="Verbose format" />
          </motion.div>
        </motion.div>

        <motion.div
          variants={arrowVariants}
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '2rem'
          }}
        >
          <svg width="60" height="80" viewBox="0 0 60 80">
            <path d="M30 0 L30 60 M10 45 L30 65 L50 45" stroke="#00B7C3" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.div>

        <motion.div
          variants={targetVariants}
          style={{
            background: 'linear-gradient(135deg, #00B7C3, #0078D4)',
            borderRadius: 16,
            padding: '1.5rem',
            textAlign: 'center',
            boxShadow: reduced ? 'none' : '0 0 40px rgba(0, 183, 195, 0.5)'
          }}
        >
          <h2 style={{ color: '#fff', margin: 0, fontSize: 24 }}>Unified Single Prompt</h2>
          <p style={{ color: '#fff', margin: '0.5rem 0 0', fontSize: 18 }}>
            1 Call • ~200 GPUs • Fewer Tokens
          </p>
        </motion.div>

        <p style={{ color: '#94a3b8', textAlign: 'center', marginTop: '1.5rem', fontSize: 14 }}>
          Objective: Reduce COGs without losing highlight quality
        </p>
      </motion.div>
    </div>
  );
};

Ch5_S1_ChallengeFraming.metadata = {
  chapter: 5,
  slide: 1,
  title: "Challenge Framing",
  audioSegments: [{
    id: "main",
    audioFilePath: "/audio/c5/s1_segment_01_main.wav",
    narrationText: "Cost efficiency while maintaining quality is critical for scaling meeting highlights globally."
  }]
};

/**
 * Chapter 5, Utterance 2 - Four Prompt Chain
 */
export const Ch5_S2_FourPrompts: SlideComponentWithMetadata = () => {
  const { reduced } = useReducedMotion();

  const prompts = [
    { id: 1, label: 'Topic Abstraction' },
    { id: 2, label: 'Extractive Selection' },
    { id: 3, label: 'Quality Ranking' },
    { id: 4, label: 'Narrative Synthesis' }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: reduced ? 0 : 0.15
      }
    }
  };

  const promptVariants = {
    hidden: { opacity: 0, x: reduced ? 0 : -40 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: reduced ? 0.2 : 0.4 }
    }
  };

  return (
    <div style={{
      background: '#0f172a',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{ maxWidth: 1000, width: '100%' }}>
        <h1 style={{ color: '#f1f5f9', marginBottom: '3rem', textAlign: 'center' }}>
          Original Four-Prompt Pipeline
        </h1>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem'
          }}
        >
          {prompts.map((prompt, idx) => (
            <React.Fragment key={prompt.id}>
              <motion.div
                variants={promptVariants}
                style={{
                  background: '#1e3a52',
                  borderRadius: 12,
                  padding: '1.5rem',
                  flex: 1,
                  textAlign: 'center',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                }}
              >
                <div style={{ color: '#00B7C3', fontSize: 36, fontWeight: 'bold' }}>
                  {prompt.id}
                </div>
                <div style={{ color: '#f1f5f9', fontSize: 14, marginTop: '0.5rem' }}>
                  {prompt.label}
                </div>
              </motion.div>
              
              {idx < prompts.length - 1 && (
                <motion.svg
                  width="40"
                  height="40"
                  viewBox="0 0 40 40"
                  variants={promptVariants}
                >
                  <path d="M5 20 L30 20 M20 10 L30 20 L20 30" stroke="#475569" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </motion.svg>
              )}
            </React.Fragment>
          ))}
        </motion.div>

        <p style={{ color: '#94a3b8', textAlign: 'center', marginTop: '2rem', fontSize: 16 }}>
          Sequential calls drove high COGs and complexity
        </p>
      </div>
    </div>
  );
};

Ch5_S2_FourPrompts.metadata = {
  chapter: 5,
  slide: 2,
  title: "Four-Prompt Pipeline",
  audioSegments: [{
    id: "main",
    audioFilePath: "/audio/c5/s2_segment_01_main.wav",
    narrationText: "The initial implementation required 4 sequential LLM calls per meeting, creating significant computational costs."
  }]
};

/**
 * Chapter 6, Utterance 1 - Unified Convergence
 */
export const Ch6_S1_UnifiedConvergence: SlideComponentWithMetadata = () => {
  const { reduced } = useReducedMotion();

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
      <div style={{ maxWidth: 900, width: '100%', textAlign: 'center' }}>
        <h1 style={{ color: '#f1f5f9', marginBottom: '3rem' }}>
          Unified Single Prompt
        </h1>

        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: reduced ? 0.3 : 0.8, type: 'spring' }}
          style={{ position: 'relative', display: 'inline-block' }}
        >
          {/* Central unified node */}
          <motion.div
            style={{
              width: 200,
              height: 200,
              background: 'linear-gradient(135deg, #00B7C3, #0078D4)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: reduced ? '0 8px 24px rgba(0, 183, 195, 0.4)' : '0 0 60px rgba(0, 183, 195, 0.6)',
              position: 'relative',
              zIndex: 2
            }}
            animate={reduced ? {} : {
              boxShadow: [
                '0 0 60px rgba(0, 183, 195, 0.6)',
                '0 0 80px rgba(0, 183, 195, 0.8)',
                '0 0 60px rgba(0, 183, 195, 0.6)'
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div style={{ color: '#fff', fontSize: 24, fontWeight: 'bold', textAlign: 'center' }}>
              Unified<br/>Prompt
            </div>
          </motion.div>

          {/* Converging lines */}
          {!reduced && [0, 90, 180, 270].map((angle, idx) => (
            <motion.div
              key={angle}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [1, 0], scale: [1, 0] }}
              transition={{
                duration: 1.2,
                delay: idx * 0.1,
                repeat: Infinity,
                repeatDelay: 2
              }}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: 120,
                height: 2,
                background: 'linear-gradient(90deg, #00B7C3, transparent)',
                transformOrigin: 'left center',
                transform: `translate(-50%, -50%) rotate(${angle}deg)`
              }}
            />
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduced ? 0.3 : 1, duration: 0.5 }}
          style={{ marginTop: '3rem' }}
        >
          <div style={{ fontSize: 48, fontWeight: 'bold', color: '#00B7C3', marginBottom: '1rem' }}>
            <span style={{ textDecoration: 'line-through', opacity: 0.6 }}>4</span> → 1 Call
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
            <MetricTile label="Success Rate" before="92%" after="99%" emphasis note="Improved in local testing" />
          </div>

          <p style={{ color: '#94a3b8', marginTop: '1.5rem', fontSize: 16 }}>
            All stages executed in one inference
          </p>
        </motion.div>
      </div>
    </div>
  );
};

Ch6_S1_UnifiedConvergence.metadata = {
  chapter: 6,
  slide: 1,
  title: "Unified Convergence",
  audioSegments: [{
    id: "main",
    audioFilePath: "/audio/c6/s1_segment_01_main.wav",
    narrationText: "We collapsed the four-step pipeline into one unified prompt with leaner input."
  }]
};

/**
 /**
  * Chapter 7, Utterance 1 - Call & Token Reduction
  */
 export const Ch7_S1_CallReduction: SlideComponentWithMetadata = () => {
   const { reduced } = useReducedMotion();
 
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
       <div style={{ maxWidth: 1000, width: '100%' }}>
         <h1 style={{ color: '#f1f5f9', marginBottom: '3rem', textAlign: 'center' }}>
           Optimization Impact
         </h1>
 
         <div style={{ display: 'flex', gap: '3rem', justifyContent: 'center', alignItems: 'center' }}>
           {/* LLM Call Reduction Dial */}
           <div style={{ textAlign: 'center' }}>
             <h2 style={{ color: '#f1f5f9', fontSize: 20, marginBottom: '1.5rem' }}>
               LLM Call Reduction
             </h2>
             <svg width="280" height="280" viewBox="0 0 300 300">
               {/* Dial background */}
               <circle cx="150" cy="150" r="120" fill="#1e293b" stroke="#334155" strokeWidth="2" />
               
               {/* 4 segments */}
               {[0, 1, 2, 3].map((seg) => (
                 <motion.path
                   key={seg}
                   d={`M 150 150 L ${150 + 100 * Math.cos((seg * 90 - 90) * Math.PI / 180)} ${150 + 100 * Math.sin((seg * 90 - 90) * Math.PI / 180)} A 100 100 0 0 1 ${150 + 100 * Math.cos(((seg + 1) * 90 - 90) * Math.PI / 180)} ${150 + 100 * Math.sin(((seg + 1) * 90 - 90) * Math.PI / 180)} Z`}
                   fill={seg === 0 ? '#00B7C3' : '#1e293b'}
                   stroke="#334155"
                   strokeWidth="2"
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   transition={{ delay: seg * (reduced ? 0.05 : 0.2), duration: reduced ? 0.2 : 0.4 }}
                 />
               ))}
 
               {/* Needle */}
               <motion.line
                 x1="150"
                 y1="150"
                 x2="150"
                 y2="60"
                 stroke="#f1f5f9"
                 strokeWidth="4"
                 strokeLinecap="round"
                 initial={{ rotate: reduced ? 0 : 270 }}
                 animate={{ rotate: 0 }}
                 transition={{ duration: reduced ? 0.3 : 1.5, type: 'spring' }}
                 style={{ transformOrigin: '150px 150px' }}
               />
               
               {/* Center dot */}
               <circle cx="150" cy="150" r="8" fill="#f1f5f9" />
             </svg>
 
             <motion.div
               initial={{ opacity: 0, scale: 0.8 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: reduced ? 0.3 : 1.5, duration: 0.5 }}
               style={{
                 marginTop: '1rem',
                 fontSize: 36,
                 fontWeight: 'bold',
                 color: '#00B7C3'
               }}
             >
               75%
             </motion.div>
             <p style={{ color: '#94a3b8', marginTop: '0.5rem', fontSize: 14 }}>
               4 → 1 calls
             </p>
           </div>
 
           {/* Token Reduction Bar */}
           <div style={{ textAlign: 'center' }}>
             <h2 style={{ color: '#f1f5f9', fontSize: 20, marginBottom: '1.5rem' }}>
               Input Token Reduction
             </h2>
             
             <div style={{ position: 'relative', width: 280, height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               {/* Token bars */}
               <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
                 {/* Before bar */}
                 <motion.div
                   initial={{ width: 0 }}
                   animate={{ width: 240 }}
                   transition={{ duration: reduced ? 0.3 : 1, delay: reduced ? 0 : 0.3 }}
                   style={{
                     height: 40,
                     background: '#475569',
                     borderRadius: 8,
                     position: 'relative',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center'
                   }}
                 >
                   <span style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>100%</span>
                 </motion.div>
 
                 {/* Arrow down */}
                 <motion.svg
                   width="40"
                   height="40"
                   viewBox="0 0 40 40"
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   transition={{ delay: reduced ? 0.2 : 1.3 }}
                 >
                   <path d="M20 5 L20 30 M10 20 L20 30 L30 20" stroke="#00B7C3" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                 </motion.svg>
 
                 {/* After bar */}
                 <motion.div
                   initial={{ width: 0 }}
                   animate={{ width: 96 }}
                   transition={{ duration: reduced ? 0.3 : 1, delay: reduced ? 0.3 : 1.5 }}
                   style={{
                     height: 40,
                     background: 'linear-gradient(135deg, #00B7C3, #0078D4)',
                     borderRadius: 8,
                     position: 'relative',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center',
                     boxShadow: reduced ? 'none' : '0 0 20px rgba(0, 183, 195, 0.5)'
                   }}
                 >
                   <span style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>40%</span>
                 </motion.div>
               </div>
             </div>
 
             <motion.div
               initial={{ opacity: 0, scale: 0.8 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: reduced ? 0.4 : 2, duration: 0.5 }}
               style={{
                 marginTop: '1rem',
                 fontSize: 36,
                 fontWeight: 'bold',
                 color: '#00B7C3'
               }}
             >
               60%
             </motion.div>
             <p style={{ color: '#94a3b8', marginTop: '0.5rem', fontSize: 14 }}>
               token reduction
             </p>
           </div>
         </div>
       </div>
     </div>
   );
 };
Ch7_S1_CallReduction.metadata = {
  chapter: 7,
  slide: 1,
  title: "Call Reduction",
  audioSegments: [{
    id: "main",
    audioFilePath: "/audio/c7/s1_segment_01_main.wav",
    narrationText: "The impact: 75% fewer model invocations per meeting, and 60% reduction in input tokens."
  }]
};

/**
 * Chapter 7, Utterance 2 - GPU Reduction
 */
export const Ch7_S2_GPUReduction: SlideComponentWithMetadata = () => {
  const { reduced } = useReducedMotion();

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
      <div style={{ maxWidth: 800, width: '100%', textAlign: 'center' }}>
        <h1 style={{ color: '#f1f5f9', marginBottom: '3rem' }}>
          GPU Capacity Optimization
        </h1>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', alignItems: 'center' }}>
          {/* Before - 3 racks */}
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: reduced ? 0.3 : [1, 0.3] }}
            transition={{ duration: reduced ? 0.3 : 1, delay: reduced ? 0 : 0.5 }}
            style={{ display: 'flex', gap: '0.5rem' }}
          >
            {[1, 2, 3].map((rack) => (
              <motion.div
                key={rack}
                initial={{ opacity: 1, scale: 1 }}
                animate={reduced ? {} : {
                  opacity: rack === 1 ? 1 : 0,
                  scale: rack === 1 ? 1 : 0.5
                }}
                transition={{ duration: 0.6, delay: 1 + (rack - 1) * 0.2 }}
                style={{
                  width: 60,
                  height: 120,
                  background: '#1e3a52',
                  borderRadius: 8,
                  border: '2px solid #334155',
                  position: 'relative'
                }}
              >
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    style={{
                      height: 20,
                      margin: '4px 8px',
                      background: '#0ea5e9',
                      borderRadius: 2
                    }}
                  />
                ))}
              </motion.div>
            ))}
          </motion.div>

          <motion.svg
            width="60"
            height="40"
            viewBox="0 0 60 40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: reduced ? 0.2 : 1.8 }}
          >
            <path d="M5 20 L50 20 M35 10 L50 20 L35 30" stroke="#00B7C3" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </motion.svg>

          {/* After - 1 highlighted rack */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: reduced ? 0.3 : 0.6, delay: reduced ? 0.3 : 2 }}
            style={{
              width: 80,
              height: 140,
              background: 'linear-gradient(135deg, #00B7C3, #0078D4)',
              borderRadius: 12,
              border: '3px solid #00B7C3',
              boxShadow: reduced ? 'none' : '0 0 30px rgba(0, 183, 195, 0.6)',
              position: 'relative',
              padding: '10px'
            }}
          >
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                style={{
                  height: 24,
                  margin: '4px 0',
                  background: 'rgba(255,255,255,0.3)',
                  borderRadius: 4
                }}
              />
            ))}
            <div style={{
              position: 'absolute',
              top: -15,
              right: -15,
              width: 30,
              height: 30,
              borderRadius: '50%',
              background: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18
            }}>
              ✓
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduced ? 0.4 : 2.5, duration: 0.5 }}
          style={{ marginTop: '3rem' }}
        >
          <div style={{ fontSize: 42, fontWeight: 'bold', color: '#00B7C3' }}>
            ~600 → ~200 GPUs
          </div>
          <p style={{ color: '#94a3b8', marginTop: '1rem', fontSize: 16 }}>
            67% capacity reduction through architectural consolidation
          </p>
        </motion.div>
      </div>
    </div>
  );
};

Ch7_S2_GPUReduction.metadata = {
  chapter: 7,
  slide: 2,
  title: "GPU Optimization",
  audioSegments: [{
    id: "main",
    audioFilePath: "/audio/c7/s2_segment_01_main.wav",
    narrationText: "Estimated GPU requirements drop from 600 to 200 for global availability."
  }]
};

/**
 * Chapter 5, Utterance 3 - First Prompt: Topic Abstraction
 */
export const Ch5_S3_TopicAbstraction: SlideComponentWithMetadata = () => {
  const { reduced } = useReducedMotion();

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
      <div style={{ maxWidth: 800, width: '100%' }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0.2 : 0.5 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #00B7C3, #0078D4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              fontWeight: 'bold',
              color: '#fff'
            }}>
              1
            </div>
            <h1 style={{ color: '#f1f5f9', margin: 0 }}>
              Prompt 1: Topic Abstraction
            </h1>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0.2 : 0.6, delay: reduced ? 0 : 0.2 }}
          style={{
            background: '#1e293b',
            borderRadius: 16,
            padding: '2rem',
            border: '1px solid #334155'
          }}
        >
          <p style={{ color: '#e2e8f0', fontSize: 18, lineHeight: 1.6, marginTop: 0 }}>
            The first prompt analyzed the transcript to segment it into key topics, identifying one to seven distinct discussion areas within each meeting.
          </p>
          
          <ul style={{ color: '#94a3b8', fontSize: 16, lineHeight: 1.8 }}>
            <li>Segments transcript into 1-7 topics</li>
            <li>Generates narration summaries</li>
            <li>Selects video playback anchors</li>
            <li>Categorizes topics by type</li>
            <li>Assesses interest levels</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
};

Ch5_S3_TopicAbstraction.metadata = {
  chapter: 5,
  slide: 3,
  title: "Prompt 1: Topic Abstraction",
  audioSegments: [{ id: "main", audioFilePath: "/audio/c5/s3_segment_01_main.wav" }]
};

/**
 * Chapter 5, Utterance 4 - Second Prompt: Extractive Selection
 */
export const Ch5_S4_ExtractiveSelection: SlideComponentWithMetadata = () => {
  const { reduced } = useReducedMotion();

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
      <div style={{ maxWidth: 800, width: '100%' }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0.2 : 0.5 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #00B7C3, #0078D4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              fontWeight: 'bold',
              color: '#fff'
            }}>
              2
            </div>
            <h1 style={{ color: '#f1f5f9', margin: 0 }}>
              Prompt 2: Extractive Selection
            </h1>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0.2 : 0.6, delay: reduced ? 0 : 0.2 }}
          style={{
            background: '#1e293b',
            borderRadius: 16,
            padding: '2rem',
            border: '1px solid #334155'
          }}
        >
          <p style={{ color: '#e2e8f0', fontSize: 18, lineHeight: 1.6, marginTop: 0 }}>
            The second prompt extracted engaging verbatim moments from the meeting, selecting up to ten self-contained utterance blocks that captured important feedback, exciting news, or demonstration segments.
          </p>
          
          <ul style={{ color: '#94a3b8', fontSize: 16, lineHeight: 1.8 }}>
            <li>Identifies engaging verbatim moments</li>
            <li>Selects up to 10 self-contained blocks</li>
            <li>Filters by content type (feedback/news/demo)</li>
            <li>Ensures coherent boundaries</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
};

Ch5_S4_ExtractiveSelection.metadata = {
  chapter: 5,
  slide: 4,
  title: "Prompt 2: Extractive Selection",
  audioSegments: [{ id: "main", audioFilePath: "/audio/c5/s4_segment_01_main.wav" }]
};

/**
 * Chapter 5, Utterance 5 - Third Prompt: Quality Ranking
 */
export const Ch5_S5_QualityRanking: SlideComponentWithMetadata = () => {
  const { reduced } = useReducedMotion();

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
      <div style={{ maxWidth: 800, width: '100%' }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0.2 : 0.5 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #00B7C3, #0078D4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              fontWeight: 'bold',
              color: '#fff'
            }}>
              3
            </div>
            <h1 style={{ color: '#f1f5f9', margin: 0 }}>
              Prompt 3: Quality Ranking
            </h1>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0.2 : 0.6, delay: reduced ? 0 : 0.2 }}
          style={{
            background: '#1e293b',
            borderRadius: 16,
            padding: '2rem',
            border: '1px solid #334155'
          }}
        >
          <p style={{ color: '#e2e8f0', fontSize: 18, lineHeight: 1.6, marginTop: 0 }}>
            The third prompt ranked these extracted moments by quality, assessing clarity, intelligibility, self-containment, and overall interest level.
          </p>
          
          <ul style={{ color: '#94a3b8', fontSize: 16, lineHeight: 1.8 }}>
            <li>Assesses clarity and intelligibility</li>
            <li>Evaluates self-containment</li>
            <li>Scores interest level (0-100)</li>
            <li>Provides overall quality ranking</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
};

Ch5_S5_QualityRanking.metadata = {
  chapter: 5,
  slide: 5,
  title: "Prompt 3: Quality Ranking",
  audioSegments: [{ id: "main", audioFilePath: "/audio/c5/s5_segment_01_main.wav" }]
};

/**
 * Chapter 5, Utterance 6 - Fourth Prompt: Narrative Synthesis
 */
export const Ch5_S6_NarrativeSynthesis: SlideComponentWithMetadata = () => {
  const { reduced } = useReducedMotion();

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
      <div style={{ maxWidth: 800, width: '100%' }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0.2 : 0.5 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #00B7C3, #0078D4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              fontWeight: 'bold',
              color: '#fff'
            }}>
              4
            </div>
            <h1 style={{ color: '#f1f5f9', margin: 0 }}>
              Prompt 4: Narrative Synthesis
            </h1>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0.2 : 0.6, delay: reduced ? 0 : 0.2 }}
          style={{
            background: '#1e293b',
            borderRadius: 16,
            padding: '2rem',
            border: '1px solid #334155'
          }}
        >
          <p style={{ color: '#e2e8f0', fontSize: 18, lineHeight: 1.6, marginTop: 0 }}>
            The fourth prompt synthesized everything into a cohesive narrative, rephrasing summaries and creating smooth transitions between abstractive and extractive sections.
          </p>
          
          <ul style={{ color: '#94a3b8', fontSize: 16, lineHeight: 1.8 }}>
            <li>Rephrases narrations for story flow</li>
            <li>Creates transition sentences</li>
            <li>Unifies abstractive + extractive sections</li>
            <li>Ensures gender-neutral language</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
};

Ch5_S6_NarrativeSynthesis.metadata = {
  chapter: 5,
  slide: 6,
  title: "Prompt 4: Narrative Synthesis",
  audioSegments: [{ id: "main", audioFilePath: "/audio/c6/s6_segment_01_main.wav" }]
};

/**
 * Chapter 6, Utterance 2 - Unified Flow Details
 */
export const Ch6_S2_UnifiedFlow: SlideComponentWithMetadata = () => {
  const { reduced } = useReducedMotion();

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
      <div style={{ maxWidth: 900, width: '100%', textAlign: 'center' }}>
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0.2 : 0.5 }}
          style={{ color: '#f1f5f9', marginBottom: '2rem' }}
        >
          Unified Prompt: Same Logical Flow
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0.2 : 0.6, delay: reduced ? 0 : 0.2 }}
          style={{
            background: '#1e293b',
            borderRadius: 16,
            padding: '2rem',
            border: '1px solid #334155',
            marginBottom: '2rem'
          }}
        >
          <p style={{ color: '#e2e8f0', fontSize: 18, lineHeight: 1.6 }}>
            The new unified prompt processes transcripts through the same logical flow: segment into topics, write narrations, extract verbatim ranges, rank by quality, and build the final narrative.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reduced ? 0.2 : 0.8, delay: reduced ? 0 : 0.4 }}
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '0.5rem',
            flexWrap: 'wrap'
          }}
        >
          {['Segment', 'Narrate', 'Extract', 'Rank', 'Compose'].map((step, idx) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: reduced ? 0.1 : 0.3, delay: reduced ? 0 : 0.5 + idx * 0.1 }}
              style={{
                background: 'linear-gradient(135deg, #00B7C3, #0078D4)',
                borderRadius: 8,
                padding: '0.75rem 1.5rem',
                color: '#fff',
                fontWeight: 600,
                fontSize: 16
              }}
            >
              {step}
            </motion.div>
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reduced ? 0.2 : 0.5, delay: reduced ? 0 : 1 }}
          style={{ color: '#94a3b8', marginTop: '2rem', fontSize: 16 }}
        >
          All in a single LLM invocation
        </motion.p>
      </div>
    </div>
  );
};

Ch6_S2_UnifiedFlow.metadata = {
  chapter: 6,
  slide: 2,
  title: "Unified Flow Details",
  audioSegments: [{
    id: "main",
    audioFilePath: "/audio/c6/s2_segment_01_main.wav",
    narrationText: "Dedicated tuning preserved the original algorithm as an internal reasoning chain: segment, extract, rank, compose."
  }]
};

/**
 * Chapter 6, Utterance 4 - Token Optimization
 */
export const Ch6_S4_TokenOptimization: SlideComponentWithMetadata = () => {
  const { reduced } = useReducedMotion();

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
      <div style={{ maxWidth: 800, width: '100%', textAlign: 'center' }}>
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0.2 : 0.5 }}
          style={{ color: '#f1f5f9', marginBottom: '3rem' }}
        >
          Input Token Optimization
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: reduced ? 0.2 : 0.6, delay: reduced ? 0 : 0.2 }}
          style={{
            background: '#1e293b',
            borderRadius: 16,
            padding: '2rem',
            border: '1px solid #334155'
          }}
        >
          <p style={{ color: '#e2e8f0', fontSize: 18, lineHeight: 1.6, marginBottom: '2rem' }}>
            Beyond reducing LLM calls, we transformed the input approach: switching from verbose JSON to compact schema, and critically, eliminating pre-computed candidate ranges—now the model selects extractive ranges directly from the transcript. This required extensive prompt tuning but dramatically reduced input tokens.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <MetricTile label="Abstractive Input" before="Verbose JSON" after="Compact Schema" note="Format streamlined" />
            <MetricTile label="Extractive Input" before="Candidate Range Combinations" after="Direct Selection" note="Model-driven" emphasis />
            <MetricTile label="Total Tokens" before="Higher" after="Lower" note="Per meeting" />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

Ch6_S4_TokenOptimization.metadata = {
  chapter: 6,
  slide: 4,
  title: "Token Optimization",
  audioSegments: [{
    id: "main",
    audioFilePath: "/audio/c6/s4_segment_01_main.wav",
    narrationText: "We also optimized input tokens by switching from verbose JSON to compact schema and eliminating pre-computed candidate ranges."
  }]
};

/**
 * Chapter 7, Utterance 5 - Path to General Availability
 */
export const Ch7_S5_PathToGA: SlideComponentWithMetadata = () => {
  const { reduced } = useReducedMotion();

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
      <div style={{ maxWidth: 900, width: '100%', textAlign: 'center' }}>
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0.2 : 0.5 }}
          style={{ color: '#f1f5f9', marginBottom: '3rem' }}
        >
          Path to General Availability
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: reduced ? 0.2 : 0.6, delay: reduced ? 0 : 0.2 }}
          style={{
            background: '#1e293b',
            borderRadius: 16,
            padding: '2rem',
            border: '1px solid #334155',
            marginBottom: '2rem'
          }}
        >
          <p style={{ color: '#e2e8f0', fontSize: 18, lineHeight: 1.6, marginBottom: '2rem' }}>
            These cost and quality improvements directly unblock the private preview release and pave the way for general availability within approved capacity constraints.
          </p>

          {/* Roadmap arrow */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: reduced ? 0.3 : 1, delay: reduced ? 0 : 0.4 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2rem',
              marginTop: '2rem'
            }}
          >
            {/* Private Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduced ? 0.2 : 0.5, delay: reduced ? 0 : 0.6 }}
              style={{
                background: 'linear-gradient(135deg, #00B7C3, #0078D4)',
                borderRadius: 12,
                padding: '1.5rem',
                minWidth: 180,
                boxShadow: reduced ? 'none' : '0 4px 12px rgba(0, 183, 195, 0.3)'
              }}
            >
              <div style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: '0.5rem' }}>
                Private Preview
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>
                Enabled by COGS reduction
              </div>
            </motion.div>

            {/* Arrow */}
            <motion.svg
              width="80"
              height="40"
              viewBox="0 0 80 40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: reduced ? 0 : 0.8 }}
            >
              <path d="M5 20 L70 20 M55 10 L70 20 L55 30" stroke="#00B7C3" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </motion.svg>

            {/* General Availability */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduced ? 0.2 : 0.5, delay: reduced ? 0 : 1 }}
              style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                borderRadius: 12,
                padding: '1.5rem',
                minWidth: 180,
                boxShadow: reduced ? 'none' : '0 4px 12px rgba(16, 185, 129, 0.3)',
                position: 'relative'
              }}
            >
              <div style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: '0.5rem' }}>
                General Availability
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>
                Within capacity limits
              </div>
              
              {/* Capacity check badge */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: reduced ? 0 : 1.2, type: 'spring' }}
                style={{
                  position: 'absolute',
                  top: -12,
                  right: -12,
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: '#10b981',
                  border: '3px solid #0f172a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                  color: '#fff'
                }}
              >
                ✓
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reduced ? 0.2 : 0.5, delay: reduced ? 0 : 1.4 }}
          style={{ color: '#94a3b8', fontSize: 14 }}
        >
          Unified prompt optimization enables scalable global rollout
        </motion.p>
      </div>
    </div>
  );
};

Ch7_S5_PathToGA.metadata = {
  chapter: 7,
  slide: 5,
  title: "Path to GA",
  audioSegments: [{
    id: "main",
    audioFilePath: "/audio/c7/s5_segment_01_main.wav",
    narrationText: "These improvements unblock private preview and enable general availability within capacity constraints."
  }]
};

/**
 * Chapter 1, Slide 1 - What is Meeting Highlights
 */
export const Ch1_S1_WhatIsMeetingHighlights: SlideComponentWithMetadata = () => {
  const { reduced } = useReducedMotion();
  const { isSegmentVisible, isOnSegment } = useSegmentedAnimation();

  return (
    <div style={{
      background: '#0f172a',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{ maxWidth: 900, width: '100%', textAlign: 'center' }}>
        {/* Title and subtitle - always visible */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0.2 : 0.6 }}
        >
          <h1 style={{ color: '#f1f5f9', marginBottom: '0.5rem', fontSize: 48 }}>
            Meeting Highlights
          </h1>
          <p style={{ color: '#94a3b8', fontSize: 20, marginBottom: '0.5rem' }}>
            AI-generated short video recaps for meetings
          </p>
        </motion.div>
        
        {/* Thumbnail image - large in segment 0, small afterwards */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: '0.5rem',
          marginBottom: isOnSegment(0) ? '2rem' : '0.5rem'
        }}>
          <motion.img
            key={`image-${isOnSegment(0) ? 'large' : 'small'}`}
            src="/images/meeting_highlights_thumbnail.jpeg"
            alt="Meeting Highlights example"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: reduced ? 0.3 : 0.6 }}
            style={{
              width: isOnSegment(0) ? '100%' : '35%',
              maxWidth: '600px',
              borderRadius: '12px',
              boxShadow: isOnSegment(0) ? '0 8px 24px rgba(0, 0, 0, 0.4)' : 'none',
              border: '1px solid #334155',
              display: 'block',
              opacity: isOnSegment(0) ? 1 : 0.5
            }}
          />
        </div>

        <AnimatePresence>
          {isSegmentVisible(1) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: reduced ? 0.3 : 0.6, delay: reduced ? 0 : 0.2 }}
              style={{
                background: '#1e293b',
                borderRadius: 16,
                padding: '2rem',
                marginBottom: '2rem'
              }}
            >
              <p style={{ color: '#e2e8f0', fontSize: 18, lineHeight: 1.6 }}>
                Automatically generates a <strong style={{ color: '#00B7C3' }}>2-3 minute video recap</strong> of your meeting
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isSegmentVisible(2) && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: reduced ? 0.3 : 0.5 }}
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '2rem',
                marginBottom: '2rem'
              }}
            >
              <div style={{
                background: 'linear-gradient(135deg, #00B7C3, #0078D4)',
                borderRadius: 12,
                padding: '1.5rem',
                flex: 1,
                maxWidth: 200
              }}>
                <div style={{ color: '#fff', fontSize: 16, fontWeight: 600 }}>
                  AI-Generated<br/>Summaries
                </div>
              </div>
              <div style={{
                background: 'linear-gradient(135deg, #0078D4, #00B7C3)',
                borderRadius: 12,
                padding: '1.5rem',
                flex: 1,
                maxWidth: 200
              }}>
                <div style={{ color: '#fff', fontSize: 16, fontWeight: 600 }}>
                  Authentic<br/>Video Clips
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isSegmentVisible(3) && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduced ? 0.2 : 0.5 }}
              style={{ color: '#94a3b8', fontSize: 16, marginBottom: '2rem' }}
            >
              Preserves original tone, reactions, and discussion flow
            </motion.p>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isSegmentVisible(4) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: reduced ? 0.3 : 0.6 }}
              style={{
                background: '#1e293b',
                borderRadius: 16,
                padding: '1.5rem',
                border: '2px solid #00B7C3'
              }}
            >
              <p style={{ color: '#00B7C3', fontSize: 20, fontWeight: 600, margin: 0 }}>
                Catch up on missed meetings without watching hour-long recordings
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

Ch1_S1_WhatIsMeetingHighlights.metadata = {
  chapter: 1,
  slide: 1,
  title: "What is Meeting Highlights",
  srtFilePath: "highlights_demo/chapters/c1/s1_what_is_meeting_highlights.srt",
  audioSegments: [
    {
      id: "intro",
      audioFilePath: "/audio/c1/s1_segment_01_intro.wav",
      srtSegmentNumber: 1,
      visualDescription: "Title slide \"Meeting Highlights\"",
      narrationText: "Meeting Highlights is a new feature that delivers AI-generated short video recaps of your meetings."
    },
    {
      id: "ai_generation",
      audioFilePath: "/audio/c1/s1_segment_02_ai_generation.wav",
      srtSegmentNumber: 2,
      visualDescription: "Animation showing meeting recording transforming into short highlight video",
      narrationText: "It uses AI to automatically generate a short highlights video, typically 2 to 3 minutes long."
    },
    {
      id: "combination",
      audioFilePath: "/audio/c1/s1_segment_03_combination.wav",
      srtSegmentNumber: 3,
      visualDescription: "Split screen showing hour-long meeting vs 3-minute highlights",
      narrationText: "The feature combines AI-generated voiceover summaries with authentic video snippets from the actual meeting."
    },
    {
      id: "preservation",
      audioFilePath: "/audio/c1/s1_segment_04_preservation.wav",
      srtSegmentNumber: 4,
      visualDescription: "Example clips showing speakers, reactions, screen shares",
      narrationText: "This preserves the original tone, reactions, and flow of the discussion."
    },
    {
      id: "problem",
      audioFilePath: "/audio/c1/s1_segment_05_problem.wav",
      srtSegmentNumber: 5,
      visualDescription: "Pain point icons: clock (time), search (finding content), mood (missing context)",
      narrationText: "It solves a critical problem: catching up on missed meetings without watching hour-long recordings or reading lengthy transcripts."
    }
  ]
};

/**
 * Chapter 1, Slide 2 - How to Access via BizChat
 */
export const Ch1_S2_HowToAccess: SlideComponentWithMetadata = () => {
  const { reduced } = useReducedMotion();
  const { isSegmentVisible } = useSegmentedAnimation();

  return (
    <div style={{
      background: '#0f172a',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{ maxWidth: 1200, width: '100%' }}>
        <AnimatePresence>
          {isSegmentVisible(0) && (
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduced ? 0.2 : 0.5 }}
              style={{ color: '#f1f5f9', marginBottom: '2rem', textAlign: 'center' }}
            >
              How to Access Meeting Highlights
            </motion.h1>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isSegmentVisible(1) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: reduced ? 0.3 : 0.6 }}
              style={{
                display: 'grid',
                gridTemplateColumns: '1.2fr 1fr',
                gap: '2rem',
                alignItems: 'start'
              }}
            >
              {/* Left column: Video */}
              <div style={{
                background: '#1e293b',
                borderRadius: 16,
                padding: '2rem',
                border: '1px solid #334155'
              }}>
                <p style={{ color: '#e2e8f0', fontSize: 18, marginBottom: '1.5rem', marginTop: 0 }}>
                  Open <strong style={{ color: '#00B7C3' }}>BizChat</strong> and ask it to recap a specific meeting
                </p>
                <div style={{
                  background: '#0f172a',
                  borderRadius: 12,
                  padding: '1.5rem'
                }}>
                  <VideoPlayer
                    videoPath="/videos/meeting_highlights_usage_in_bizchat.mp4"
                    isPlaying={isSegmentVisible(1)}
                    freezeOnEnd={true}
                  />
                </div>
              </div>

              {/* Right column: Instructions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <AnimatePresence>
                  {isSegmentVisible(2) && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: reduced ? 0.2 : 0.5 }}
                      style={{
                        background: '#1e293b',
                        borderRadius: 12,
                        padding: '1.5rem',
                        border: '1px solid #334155'
                      }}
                    >
                      <p style={{ color: '#e2e8f0', fontSize: 15, margin: 0 }}>
                        💡 Use <strong style={{ color: '#00B7C3' }}>/</strong> (slash) for Contextual Instant Query
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {isSegmentVisible(3) && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: reduced ? 0.2 : 0.5 }}
                      style={{
                        background: '#1e293b',
                        borderRadius: 12,
                        padding: '1.5rem',
                        border: '1px solid #334155'
                      }}
                    >
                      <p style={{ color: '#e2e8f0', fontSize: 15, margin: 0 }}>
                        📋 Select and search for meetings from the menu
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {isSegmentVisible(4) && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: reduced ? 0.2 : 0.5 }}
                      style={{
                        background: 'linear-gradient(135deg, rgba(0, 183, 195, 0.2), rgba(0, 120, 212, 0.2))',
                        borderRadius: 12,
                        padding: '1.5rem',
                        border: '2px solid #00B7C3'
                      }}
                    >
                      <p style={{ color: '#e2e8f0', fontSize: 15, margin: 0 }}>
                        🎬 Video player with highlights appears at the bottom
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {isSegmentVisible(5) && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: reduced ? 0.3 : 0.5 }}
                      style={{
                        background: '#78350f',
                        borderRadius: 12,
                        padding: '1.25rem',
                        border: '1px solid #fbbf24'
                      }}
                    >
                      <p style={{ color: '#fef3c7', fontSize: 14, margin: 0 }}>
                        ⚠️ Note: Series meetings don't show the highlights player yet
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {isSegmentVisible(6) && (
                    <motion.p
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: reduced ? 0.2 : 0.5 }}
                      style={{ color: '#94a3b8', fontSize: 13, marginTop: '0.5rem', marginBottom: 0 }}
                    >
                      Additional entry points via Teams and M365 Copilot coming soon
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

Ch1_S2_HowToAccess.metadata = {
  chapter: 1,
  slide: 2,
  title: "How to Access",
  srtFilePath: "highlights_demo/chapters/c1/s2_how_to_access.srt",
  audioSegments: [
    {
      id: "intro",
      audioFilePath: "/audio/c1/s2_segment_01_intro.wav",
      srtSegmentNumber: 1,
      visualDescription: "BizChat interface screenshot",
      narrationText: "Let me show you how to access Meeting Highlights through BizChat."
    },
    {
      id: "bizchat",
      audioFilePath: "/audio/c1/s2_segment_02_bizchat.wav",
      srtSegmentNumber: 2,
      visualDescription: "Embedded MP4 demo video showing BizChat interaction",
      narrationText: "Open BizChat and ask it to recap a specific meeting."
    },
    {
      id: "ciq",
      audioFilePath: "/audio/c1/s2_segment_03_ciq.wav",
      srtSegmentNumber: 3,
      visualDescription: "Demo continues - showing \"/\" menu for CIQ",
      narrationText: "You can reference specific meetings using C-I-Q by typing a forward slash."
    },
    {
      id: "select",
      audioFilePath: "/audio/c1/s2_segment_04_select.wav",
      srtSegmentNumber: 4,
      visualDescription: "Demo shows meeting selection from menu",
      narrationText: "This opens a menu to select and search for meetings to add to your message."
    },
    {
      id: "player",
      audioFilePath: "/audio/c1/s2_segment_05_player.wav",
      srtSegmentNumber: 5,
      visualDescription: "Demo shows BizChat response with video player at bottom",
      narrationText: "BizChat will return a reply to your query and a video player with the meeting highlights appears at the bottom."
    },
    {
      id: "note",
      audioFilePath: "/audio/c1/s2_segment_06_note.wav",
      srtSegmentNumber: 6,
      visualDescription: "Note callout appears",
      narrationText: "Note: If the meeting is a series meeting, BizChat currently won't show the highlights player yet."
    },
    {
      id: "future",
      audioFilePath: "/audio/c1/s2_segment_07_future.wav",
      srtSegmentNumber: 7,
      visualDescription: "Icons showing Teams, BizChat, M365 Copilot entry points",
      narrationText: "We're working on additional ways to surface highlights via BizChat and Teams."
    }
  ]
};

/**
 * Chapter 1, Slide 3 - User Value Proposition
 */
export const Ch1_S3_UserValue: SlideComponentWithMetadata = () => {
  const { reduced } = useReducedMotion();
  const { isSegmentVisible } = useSegmentedAnimation();

  const benefits = [
    {
      icon: '⏱️',
      title: 'Time Savings',
      description: '60 minutes → 2-3 minutes',
      detail: 'Catch up without watching full recordings'
    },
    {
      icon: '🎯',
      title: 'Better Engagement',
      description: 'Audiovisual content',
      detail: 'Caters to all learning styles'
    },
    {
      icon: '💬',
      title: 'Meeting Dynamics',
      description: 'Tone and vibe preserved',
      detail: 'Not just facts, but context'
    }
  ];

  return (
    <div style={{
      background: '#0f172a',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{ maxWidth: 1100, width: '100%' }}>
        <AnimatePresence>
          {isSegmentVisible(0) && (
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduced ? 0.2 : 0.5 }}
              style={{ color: '#f1f5f9', marginBottom: '3rem', textAlign: 'center' }}
            >
              Three Key Benefits
            </motion.h1>
          )}
        </AnimatePresence>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '2rem',
          marginBottom: '3rem'
        }}>
          {benefits.map((benefit, index) => (
            <AnimatePresence key={benefit.title}>
              {isSegmentVisible(index + 1) && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: reduced ? 0.3 : 0.6, type: 'spring' }}
                  style={{
                    background: index === 0 ? 'linear-gradient(135deg, rgba(0, 183, 195, 0.2), rgba(0, 120, 212, 0.2))' : '#1e293b',
                    borderRadius: 16,
                    padding: '2rem',
                    textAlign: 'center',
                    border: index === 0 ? '2px solid #00B7C3' : '1px solid #334155',
                    boxShadow: index === 0 && !reduced ? '0 0 30px rgba(0, 183, 195, 0.3)' : 'none'
                  }}
                >
                  <div style={{ fontSize: 48, marginBottom: '1rem' }}>{benefit.icon}</div>
                  <h3 style={{ color: '#f1f5f9', fontSize: 20, marginBottom: '0.5rem' }}>
                    {benefit.title}
                  </h3>
                  <div style={{ color: '#00B7C3', fontSize: 18, fontWeight: 600, marginBottom: '0.75rem' }}>
                    {benefit.description}
                  </div>
                  <p style={{ color: '#94a3b8', fontSize: 14, margin: 0 }}>
                    {benefit.detail}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          ))}
        </div>

        <AnimatePresence>
          {isSegmentVisible(4) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduced ? 0.3 : 0.6 }}
              style={{
                background: '#1e293b',
                borderRadius: 16,
                padding: '2rem',
                textAlign: 'center',
                border: '1px solid #334155'
              }}
            >
              <p style={{ color: '#e2e8f0', fontSize: 18, fontStyle: 'italic', marginBottom: '1rem' }}>
                "Saved me hours of reviewing the transcript. This is magical."
              </p>
              <p style={{ color: '#94a3b8', fontSize: 14, margin: 0 }}>
                — Internal User Feedback
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

Ch1_S3_UserValue.metadata = {
  chapter: 1,
  slide: 3,
  title: "User Value",
  srtFilePath: "highlights_demo/chapters/c1/s3_user_value.srt",
  audioSegments: [
    {
      id: "intro",
      audioFilePath: "/audio/c1/s3_segment_01_intro.wav",
      srtSegmentNumber: 1,
      visualDescription: "3 value proposition cards appear",
      narrationText: "Meeting Highlights delivers three key benefits to users."
    },
    {
      id: "time",
      audioFilePath: "/audio/c1/s3_segment_02_time.wav",
      srtSegmentNumber: 2,
      visualDescription: "Card 1 highlights - clock icon with \"60 min → 3 min\"",
      narrationText: "First, massive time savings. Instead of watching a 60-minute recording, catch up in 2 to 3 minutes."
    },
    {
      id: "engagement",
      audioFilePath: "/audio/c1/s3_segment_03_engagement.wav",
      srtSegmentNumber: 3,
      visualDescription: "Card 2 highlights - engagement icons (eyes, ears, text)",
      narrationText: "Second, better engagement and retention through audiovisual content that caters to all learning styles."
    },
    {
      id: "dynamics",
      audioFilePath: "/audio/c1/s3_segment_04_dynamics.wav",
      srtSegmentNumber: 4,
      visualDescription: "Card 3 highlights - mood/vibe icons showing emotions",
      narrationText: "Third, preserved meeting dynamics. You get the tone and vibe of discussions, not just facts."
    },
    {
      id: "testimonial",
      audioFilePath: "/audio/c1/s3_segment_05_testimonial.wav",
      srtSegmentNumber: 5,
      visualDescription: "User testimonial quote appears",
      narrationText: "Internal users have called it magical, with one manager saying it saved hours of reviewing transcripts."
    }
  ]
};

/**
 * Chapter 3, Slide 1 - Architecture Overview
 */
export const Ch3_S1_ArchitectureOverview: SlideComponentWithMetadata = () => {
  const { reduced } = useReducedMotion();
  const { isSegmentVisible } = useSegmentedAnimation();

  return (
    <div style={{
      background: '#0f172a',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{ maxWidth: 1000, width: '100%' }}>
        <AnimatePresence>
          {isSegmentVisible(0) && (
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduced ? 0.2 : 0.5 }}
              style={{ color: '#f1f5f9', marginBottom: '3rem', textAlign: 'center' }}
            >
              Architecture Overview
            </motion.h1>
          )}
        </AnimatePresence>

        {/* Architecture flow diagram */}
        <div style={{
          background: '#1e293b',
          borderRadius: 16,
          padding: '2rem',
          border: '1px solid #334155'
        }}>
          <AnimatePresence>
            {isSegmentVisible(1) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: reduced ? 0.3 : 0.6 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  marginBottom: '1.5rem',
                  padding: '1rem',
                  background: 'rgba(0, 183, 195, 0.1)',
                  borderRadius: 8
                }}
              >
                <div style={{ fontSize: 32 }}>📹</div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#f1f5f9', fontWeight: 600 }}>Teams Recording</div>
                  <div style={{ color: '#94a3b8', fontSize: 14 }}>Meeting ends, event triggered</div>
                </div>
                <div style={{ color: '#00B7C3', fontSize: 24 }}>→</div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isSegmentVisible(2) && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: reduced ? 0.3 : 0.5 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  marginBottom: '1.5rem',
                  padding: '1rem',
                  background: 'rgba(0, 183, 195, 0.1)',
                  borderRadius: 8
                }}
              >
                <div style={{ fontSize: 32 }}>🗄️</div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#f1f5f9', fontWeight: 600 }}>ODSP</div>
                  <div style={{ color: '#94a3b8', fontSize: 14 }}>Initiates highlight generation</div>
                </div>
                <div style={{ color: '#00B7C3', fontSize: 24 }}>→</div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isSegmentVisible(3) && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: reduced ? 0.3 : 0.5 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  marginBottom: '1.5rem',
                  padding: '1rem',
                  background: 'rgba(0, 183, 195, 0.1)',
                  borderRadius: 8
                }}
              >
                <div style={{ fontSize: 32 }}>⚙️</div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#f1f5f9', fontWeight: 600 }}>TMR Processor</div>
                  <div style={{ color: '#94a3b8', fontSize: 14 }}>Calls LLM with transcript</div>
                </div>
                <div style={{ color: '#00B7C3', fontSize: 24 }}>→</div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isSegmentVisible(4) && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: reduced ? 0.3 : 0.5 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  marginBottom: '1.5rem',
                  padding: '1rem',
                  background: 'linear-gradient(135deg, rgba(0, 183, 195, 0.2), rgba(0, 120, 212, 0.2))',
                  borderRadius: 8,
                  border: '2px solid #00B7C3'
                }}
              >
                <div style={{ fontSize: 32 }}>🤖</div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#f1f5f9', fontWeight: 600 }}>LLM Analysis</div>
                  <div style={{ color: '#94a3b8', fontSize: 14 }}>Returns highlights metadata</div>
                </div>
                <div style={{ color: '#00B7C3', fontSize: 24 }}>→</div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isSegmentVisible(5) && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: reduced ? 0.3 : 0.5 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  marginBottom: '1.5rem',
                  padding: '1rem',
                  background: 'rgba(0, 183, 195, 0.1)',
                  borderRadius: 8
                }}
              >
                <div style={{ fontSize: 32 }}>🎙️</div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#f1f5f9', fontWeight: 600 }}>Azure Cognitive Services</div>
                  <div style={{ color: '#94a3b8', fontSize: 14 }}>Generates narration audio</div>
                </div>
                <div style={{ color: '#00B7C3', fontSize: 24 }}>→</div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isSegmentVisible(6) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: reduced ? 0.3 : 0.6 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  borderRadius: 8
                }}
              >
                <div style={{ fontSize: 32 }}>✅</div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#fff', fontWeight: 600 }}>Storage & Access</div>
                  <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>
                    Available via BizChat and Teams
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

Ch3_S1_ArchitectureOverview.metadata = {
  chapter: 3,
  slide: 1,
  title: "Architecture Overview",
  srtFilePath: "highlights_demo/chapters/c3/s1_architecture_overview.srt",
  audioSegments: [
    {
      id: "intro",
      audioFilePath: "/audio/c3/s1_segment_01_intro.wav",
      srtSegmentNumber: 1,
      visualDescription: "Title \"Architecture Overview\" with system diagram placeholder",
      narrationText: "Let me walk you through the architecture behind Meeting Highlights."
    },
    {
      id: "recording",
      audioFilePath: "/audio/c3/s1_segment_02_recording.wav",
      srtSegmentNumber: 2,
      visualDescription: "Teams recording icon appears - starting point of flow",
      narrationText: "It starts when a Teams meeting ends and a recording exists."
    },
    {
      id: "odsp",
      audioFilePath: "/audio/c3/s1_segment_03_odsp.wav",
      srtSegmentNumber: 3,
      visualDescription: "ODSP component highlights with arrow from recording",
      narrationText: "ODSP, our storage and orchestration layer, detects the recording and initiates the highlight generation process."
    },
    {
      id: "tmr",
      audioFilePath: "/audio/c3/s1_segment_04_tmr.wav",
      srtSegmentNumber: 4,
      visualDescription: "TMR Processor component highlights with arrow from ODSP",
      narrationText: "The TMR processor retrieves the meeting transcript and calls our LLM."
    },
    {
      id: "llm",
      audioFilePath: "/audio/c3/s1_segment_05_llm.wav",
      srtSegmentNumber: 5,
      visualDescription: "LLM component highlights - central AI processing node",
      narrationText: "The LLM analyzes the transcript and returns structured metadata describing the highlights."
    },
    {
      id: "acs",
      audioFilePath: "/audio/c3/s1_segment_06_acs.wav",
      srtSegmentNumber: 6,
      visualDescription: "Azure Cognitive Services component with TTS icon",
      narrationText: "Azure Cognitive Services then converts the narration text into audio using text-to-speech."
    },
    {
      id: "storage",
      audioFilePath: "/audio/c3/s1_segment_07_storage.wav",
      srtSegmentNumber: 7,
      visualDescription: "Final storage in ODSP with access icons (BizChat, Teams)",
      narrationText: "Finally, all the metadata, audio, and captions are securely stored in ODSP and made available through BizChat and Teams."
    }
  ]
};

/**
 * Chapter 4, Slide 1 - Highlight Types
 */
export const Ch4_S1_HighlightTypes: SlideComponentWithMetadata = () => {
  const { reduced } = useReducedMotion();
  const { isSegmentVisible } = useSegmentedAnimation();

  return (
    <div style={{
      background: '#0f172a',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{ maxWidth: 1100, width: '100%' }}>
        <AnimatePresence>
          {isSegmentVisible(0) && (
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduced ? 0.2 : 0.5 }}
              style={{ color: '#f1f5f9', marginBottom: '3rem', textAlign: 'center' }}
            >
              Two Types of Highlights
            </motion.h1>
          )}
        </AnimatePresence>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem', marginBottom: '3rem' }}>
          <AnimatePresence>
            {isSegmentVisible(1) && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: reduced ? 0.3 : 0.6, type: 'spring' }}
                style={{
                  background: 'linear-gradient(135deg, rgba(0, 183, 195, 0.2), rgba(0, 120, 212, 0.2))',
                  borderRadius: 16,
                  padding: '2rem',
                  border: '2px solid #00B7C3',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: 48, marginBottom: '1rem' }}>📝</div>
                <h2 style={{ color: '#f1f5f9', fontSize: 24, marginBottom: '1rem' }}>
                  Abstractive Highlights
                </h2>
                <p style={{ color: '#94a3b8', fontSize: 16 }}>
                  AI-generated summaries of discussion topics
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isSegmentVisible(2) && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: reduced ? 0.3 : 0.6, type: 'spring' }}
                style={{
                  background: '#1e293b',
                  borderRadius: 16,
                  padding: '2rem',
                  border: '1px solid #334155',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: 48, marginBottom: '1rem' }}>🎬</div>
                <h2 style={{ color: '#f1f5f9', fontSize: 24, marginBottom: '1rem' }}>
                  Key Moments
                </h2>
                <p style={{ color: '#94a3b8', fontSize: 16 }}>
                  Significant verbatim segments from the meeting
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {isSegmentVisible(3) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduced ? 0.3 : 0.5 }}
              style={{
                background: '#1e293b',
                borderRadius: 16,
                padding: '1.5rem',
                marginBottom: '1.5rem',
                border: '1px solid #334155'
              }}
            >
              <p style={{ color: '#e2e8f0', fontSize: 16, margin: 0 }}>
                ⏱️ Each highlight covers <strong style={{ color: '#00B7C3' }}>20-30 second segments</strong> with timestamps and narration
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isSegmentVisible(4) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduced ? 0.3 : 0.5 }}
              style={{
                background: '#1e293b',
                borderRadius: 16,
                padding: '1.5rem',
                marginBottom: '1.5rem',
                border: '1px solid #334155'
              }}
            >
              <p style={{ color: '#e2e8f0', fontSize: 16, margin: 0 }}>
                🎙️ Narration text converted to audio using <strong style={{ color: '#00B7C3' }}>Azure Cognitive Services</strong>
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isSegmentVisible(5) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduced ? 0.3 : 0.5 }}
              style={{
                background: '#1e293b',
                borderRadius: 16,
                padding: '1.5rem',
                marginBottom: '1.5rem',
                border: '1px solid #334155'
              }}
            >
              <p style={{ color: '#e2e8f0', fontSize: 16, margin: 0 }}>
                🗄️ All metadata, audio, and captions <strong style={{ color: '#00B7C3' }}>securely stored in ODSP</strong>
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isSegmentVisible(6) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: reduced ? 0.3 : 0.6 }}
              style={{
                background: 'linear-gradient(135deg, rgba(0, 183, 195, 0.2), rgba(0, 120, 212, 0.2))',
                borderRadius: 16,
                padding: '1.5rem',
                border: '2px solid #00B7C3',
                textAlign: 'center'
              }}
            >
              <p style={{ color: '#e2e8f0', fontSize: 16, margin: 0 }}>
                📱 Available across <strong style={{ color: '#00B7C3' }}>Microsoft 365 platforms</strong>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

Ch4_S1_HighlightTypes.metadata = {
  chapter: 4,
  slide: 1,
  title: "Highlight Types",
  srtFilePath: "highlights_demo/chapters/c4/s1_highlight_types.srt",
  audioSegments: [
    {
      id: "intro",
      audioFilePath: "/audio/c4/s1_segment_01_intro.wav",
      srtSegmentNumber: 1,
      visualDescription: "Title \"Two Types of Highlights\"",
      narrationText: "Meeting Highlights combines two distinct types of highlights to create a comprehensive recap."
    },
    {
      id: "abstractive",
      audioFilePath: "/audio/c4/s1_segment_02_abstractive.wav",
      srtSegmentNumber: 2,
      visualDescription: "Left card appears - Abstractive Highlights with summary icon",
      narrationText: "First, abstractive highlights. These are AI-generated summaries that capture the key topics discussed in the meeting."
    },
    {
      id: "key_moments",
      audioFilePath: "/audio/c4/s1_segment_03_key_moments.wav",
      srtSegmentNumber: 3,
      visualDescription: "Right card appears - Key Moments with video clip icon",
      narrationText: "Second, key moments. These are significant verbatim segments extracted directly from the meeting recording."
    },
    {
      id: "timestamps",
      audioFilePath: "/audio/c4/s1_segment_04_timestamps.wav",
      srtSegmentNumber: 4,
      visualDescription: "Detail callout showing 20-30 second segments",
      narrationText: "Each highlight is a 20 to 30 second segment with precise timestamps and accompanying narration."
    },
    {
      id: "audio",
      audioFilePath: "/audio/c4/s1_segment_05_audio.wav",
      srtSegmentNumber: 5,
      visualDescription: "Azure Cognitive Services logo with audio waveform",
      narrationText: "The narration text is converted to natural-sounding audio using Azure Cognitive Services text-to-speech."
    },
    {
      id: "storage",
      audioFilePath: "/audio/c4/s1_segment_06_storage.wav",
      srtSegmentNumber: 6,
      visualDescription: "ODSP storage icon with security badge",
      narrationText: "All the metadata, audio files, and caption data are securely stored in ODSP."
    },
    {
      id: "platforms",
      audioFilePath: "/audio/c4/s1_segment_07_platforms.wav",
      srtSegmentNumber: 7,
      visualDescription: "M365 platform icons (Teams, BizChat, Copilot)",
      narrationText: "Making highlights available across Microsoft 365 platforms wherever users work."
    }
  ]
};

/**
 * Chapter 8, Slide 1 - User Satisfaction
 */
export const Ch8_S1_UserSatisfaction: SlideComponentWithMetadata = () => {
  const { reduced } = useReducedMotion();
  const { isSegmentVisible } = useSegmentedAnimation();

  return (
    <div style={{
      background: '#0f172a',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{ maxWidth: 900, width: '100%', textAlign: 'center' }}>
        <AnimatePresence>
          {isSegmentVisible(0) && (
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduced ? 0.2 : 0.5 }}
              style={{ color: '#f1f5f9', marginBottom: '1rem' }}
            >
              User Reception
            </motion.h1>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isSegmentVisible(0) && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: reduced ? 0.2 : 0.5, delay: reduced ? 0 : 0.2 }}
              style={{ color: '#94a3b8', fontSize: 16, marginBottom: '3rem' }}
            >
              MS Elite Survey Results
            </motion.p>
          )}
        </AnimatePresence>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem', marginBottom: '3rem' }}>
          <AnimatePresence>
            {isSegmentVisible(1) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: reduced ? 0.3 : 0.8, type: 'spring' }}
                style={{
                  background: 'linear-gradient(135deg, rgba(0, 183, 195, 0.2), rgba(0, 120, 212, 0.2))',
                  borderRadius: 16,
                  padding: '3rem 2rem',
                  border: '2px solid #00B7C3',
                  boxShadow: !reduced ? '0 0 40px rgba(0, 183, 195, 0.3)' : 'none'
                }}
              >
                <div style={{ fontSize: 72, fontWeight: 'bold', color: '#00B7C3', marginBottom: '1rem' }}>
                  80%
                </div>
                <div style={{ color: '#f1f5f9', fontSize: 18, marginBottom: '0.5rem' }}>
                  Extremely/Very Useful
                </div>
                <div style={{ color: '#94a3b8', fontSize: 14 }}>
                  ⭐⭐⭐⭐⭐
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isSegmentVisible(2) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: reduced ? 0.3 : 0.8, type: 'spring' }}
                style={{
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.2))',
                  borderRadius: 16,
                  padding: '3rem 2rem',
                  border: '2px solid #10b981',
                  boxShadow: !reduced ? '0 0 40px rgba(16, 185, 129, 0.3)' : 'none'
                }}
              >
                <div style={{ fontSize: 72, fontWeight: 'bold', color: '#10b981', marginBottom: '1rem' }}>
                  96%
                </div>
                <div style={{ color: '#f1f5f9', fontSize: 18, marginBottom: '0.5rem' }}>
                  Likely to Use Again
                </div>
                <div style={{ color: '#94a3b8', fontSize: 14 }}>
                  👍👍👍
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {isSegmentVisible(3) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduced ? 0.3 : 0.6 }}
              style={{
                background: '#1e293b',
                borderRadius: 16,
                padding: '2rem',
                border: '1px solid #334155'
              }}
            >
              <p style={{ color: '#e2e8f0', fontSize: 20, fontWeight: 600, margin: 0 }}>
                Strong product-market fit and daily habit formation
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

Ch8_S1_UserSatisfaction.metadata = {
  chapter: 8,
  slide: 1,
  title: "User Satisfaction",
  audioSegments: [
    {
      id: "intro",
      audioFilePath: "/audio/c8/s1_segment_01_intro.wav",
      narrationText: "Meeting Highlights has received overwhelmingly positive feedback in recent MS Elite surveys."
    },
    {
      id: "useful",
      audioFilePath: "/audio/c8/s1_segment_02_useful.wav",
      narrationText: "More than 80 percent of users rated Meeting Highlights as extremely useful or very useful."
    },
    {
      id: "likely",
      audioFilePath: "/audio/c8/s1_segment_03_likely.wav",
      narrationText: "96 percent shared that they are very likely or likely to use the feature again."
    },
    {
      id: "fit",
      audioFilePath: "/audio/c8/s1_segment_04_fit.wav",
      narrationText: "This points to strong product-market fit and daily habit formation among our users."
    }
  ]
};

/**
 * Chapter 9, Slide 1 - Testimonials
 */
export const Ch9_S1_Testimonials: SlideComponentWithMetadata = () => {
  const { reduced } = useReducedMotion();
  const { isSegmentVisible } = useSegmentedAnimation();

  const testimonials = [
    {
      author: "Kevin C.",
      quote: "Love this feature. Great way to catch up on a recap without watching the full thing."
    },
    {
      author: "Ryan Roslonsky",
      quote: "Beyond the awesome text recap, there is literally a two-minute narrated video about the meeting."
    },
    {
      author: "Ryan Roslonsky",
      quote: "It's mind-blowing and an engaging way to recap a meeting for a richer understanding of the conversation."
    },
    {
      author: "Anonymous User",
      quote: "Saved me hours of reviewing the transcript. This is magical."
    }
  ];

  return (
    <div style={{
      background: '#0f172a',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{ maxWidth: 1000, width: '100%' }}>
        <AnimatePresence>
          {isSegmentVisible(0) && (
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduced ? 0.2 : 0.5 }}
              style={{ color: '#f1f5f9', marginBottom: '3rem', textAlign: 'center' }}
            >
              User Testimonials
            </motion.h1>
          )}
        </AnimatePresence>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem' }}>
          {testimonials.map((testimonial, index) => (
            <AnimatePresence key={index}>
              {isSegmentVisible(index + 1) && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: reduced ? 0.3 : 0.6, type: 'spring' }}
                  style={{
                    background: '#1e293b',
                    borderRadius: 16,
                    padding: '2rem',
                    border: '1px solid #334155',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <div style={{ fontSize: 32, marginBottom: '1rem' }}>💬</div>
                  <p style={{
                    color: '#e2e8f0',
                    fontSize: 16,
                    lineHeight: 1.6,
                    fontStyle: 'italic',
                    flex: 1,
                    marginBottom: '1rem'
                  }}>
                    "{testimonial.quote}"
                  </p>
                  <div style={{ color: '#00B7C3', fontSize: 14, fontWeight: 600 }}>
                    — {testimonial.author}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          ))}
        </div>
      </div>
    </div>
  );
};

Ch9_S1_Testimonials.metadata = {
  chapter: 9,
  slide: 1,
  title: "Testimonials",
  audioSegments: [
    {
      id: "intro",
      audioFilePath: "/audio/c9/s1_segment_01_intro.wav",
      narrationText: "Users have shared enthusiastic feedback about Meeting Highlights."
    },
    {
      id: "kevin",
      audioFilePath: "/audio/c9/s1_segment_02_kevin.wav",
      narrationText: "Kevin C. commented: \"Love this feature. Great way to catch up on a recap without watching the full thing.\""
    },
    {
      id: "ryan1",
      audioFilePath: "/audio/c9/s1_segment_03_ryan1.wav",
      narrationText: "Ryan Roslonsky added: \"Beyond the awesome text recap, there is literally a two-minute narrated video about the meeting.\""
    },
    {
      id: "ryan2",
      audioFilePath: "/audio/c9/s1_segment_04_ryan2.wav",
      narrationText: "\"It's mind-blowing and an engaging way to recap a meeting for a richer understanding of the conversation.\""
    },
    {
      id: "anonymous",
      audioFilePath: "/audio/c9/s1_segment_05_anonymous.wav",
      narrationText: "Another user shared: \"Saved me hours of reviewing the transcript. This is magical.\""
    }
  ]
};

/**
 * Chapter 9, Slide 2 - Future Improvements
 */
export const Ch9_S2_FutureImprovements: SlideComponentWithMetadata = () => {
  const { reduced } = useReducedMotion();
  const { isSegmentVisible } = useSegmentedAnimation();

  const improvements = [
    {
      icon: '🔍',
      title: 'Detail & Specificity',
      description: 'More detailed highlights capturing nuanced discussions'
    },
    {
      icon: '📊',
      title: 'Teams Integration',
      description: 'Deeper integration with Teams Recap for seamless access'
    },
    {
      icon: '✅',
      title: 'Action Items',
      description: 'Include action items and decisions for actionable outcomes'
    },
    {
      icon: '🌍',
      title: 'Languages',
      description: 'Additional language support for global users'
    }
  ];

  return (
    <div style={{
      background: '#0f172a',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{ maxWidth: 1100, width: '100%' }}>
        <AnimatePresence>
          {isSegmentVisible(0) && (
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduced ? 0.2 : 0.5 }}
              style={{ color: '#f1f5f9', marginBottom: '1rem', textAlign: 'center' }}
            >
              Future Improvements
            </motion.h1>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isSegmentVisible(0) && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: reduced ? 0.2 : 0.5, delay: reduced ? 0 : 0.2 }}
              style={{ color: '#94a3b8', fontSize: 16, marginBottom: '3rem', textAlign: 'center' }}
            >
              User feedback drives our roadmap
            </motion.p>
          )}
        </AnimatePresence>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem', marginBottom: '3rem' }}>
          {improvements.map((improvement, index) => (
            <AnimatePresence key={improvement.title}>
              {isSegmentVisible(index + 1) && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: reduced ? 0.3 : 0.6, type: 'spring' }}
                  style={{
                    background: '#1e293b',
                    borderRadius: 16,
                    padding: '2rem',
                    border: '1px solid #334155',
                    textAlign: 'center'
                  }}
                >
                  <div style={{ fontSize: 48, marginBottom: '1rem' }}>{improvement.icon}</div>
                  <h3 style={{ color: '#f1f5f9', fontSize: 20, marginBottom: '0.75rem' }}>
                    {improvement.title}
                  </h3>
                  <p style={{ color: '#94a3b8', fontSize: 14, margin: 0 }}>
                    {improvement.description}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          ))}
        </div>

        <AnimatePresence>
          {isSegmentVisible(5) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduced ? 0.3 : 0.6 }}
              style={{
                background: 'linear-gradient(135deg, rgba(0, 183, 195, 0.2), rgba(0, 120, 212, 0.2))',
                borderRadius: 16,
                padding: '2rem',
                textAlign: 'center',
                border: '2px solid #00B7C3'
              }}
            >
              <p style={{ color: '#e2e8f0', fontSize: 20, fontWeight: 600, margin: 0 }}>
                On our roadmap for general availability in 2024
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

Ch9_S2_FutureImprovements.metadata = {
  chapter: 9,
  slide: 2,
  title: "Future Improvements",
  srtFilePath: "highlights_demo/chapters/c9/s2_future_improvements.srt",
  audioSegments: [
    {
      id: "intro",
      audioFilePath: "/audio/c9/s2_segment_01_intro.wav",
      srtSegmentNumber: 1,
      visualDescription: "Title \"Future Improvements\" with roadmap icon",
      narrationText: "Based on user feedback, we have an exciting roadmap ahead."
    },
    {
      id: "detail",
      audioFilePath: "/audio/c9/s2_segment_02_detail.wav",
      srtSegmentNumber: 2,
      visualDescription: "Card 1 appears - Detail & Specificity with magnifying glass icon",
      narrationText: "Users want more detailed and specific highlights that capture nuanced discussions."
    },
    {
      id: "teams",
      audioFilePath: "/audio/c9/s2_segment_03_teams.wav",
      srtSegmentNumber: 3,
      visualDescription: "Card 2 appears - Teams Integration with integration icon",
      narrationText: "Deeper integration with Teams Recap for seamless access to highlights."
    },
    {
      id: "action",
      audioFilePath: "/audio/c9/s2_segment_04_action.wav",
      srtSegmentNumber: 4,
      visualDescription: "Card 3 appears - Action Items with checkmark icon",
      narrationText: "Including action items and decisions to make highlights more actionable."
    },
    {
      id: "languages",
      audioFilePath: "/audio/c9/s2_segment_05_languages.wav",
      srtSegmentNumber: 5,
      visualDescription: "Card 4 appears - Languages with globe icon",
      narrationText: "And additional language support to serve our global user base."
    },
    {
      id: "roadmap",
      audioFilePath: "/audio/c9/s2_segment_06_roadmap.wav",
      srtSegmentNumber: 6,
      visualDescription: "Summary banner appears with timeline",
      narrationText: "These improvements are on our roadmap as we work toward general availability in 2024."
    }
  ]
};

/**
 * ============================================================================
 * CHAPTER 2: TEAM COLLABORATION
 * ============================================================================
 */

interface TeamInfo {
  id: string;
  name: string;
  logo: string;
  role: string;
  description: string;
}

const teams: TeamInfo[] = [
  {
    id: 'intro',
    name: 'Cross-Team Collaboration',
    logo: '',
    role: '',
    description: 'Meeting Highlights brings together six Microsoft teams'
  },
  {
    id: 'odsp',
    name: 'ODSP',
    logo: '/images/logos/odsp.png',
    role: 'Storage & Orchestration',
    description: 'Initiates highlights generation and stores all data'
  },
  {
    id: 'msai',
    name: 'MSAI-Hive',
    logo: '/images/logos/msai-hive.png',
    role: 'AI Generation',
    description: 'Processes transcripts using LLM technology'
  },
  {
    id: 'clipchamp',
    name: 'Clipchamp',
    logo: '/images/logos/ClipChamp.png',
    role: 'Video Player',
    description: 'Owns the highlights player component'
  },
  {
    id: 'loop',
    name: 'Loop',
    logo: '/images/logos/Loop.png',
    role: 'Integration Layer',
    description: 'Enables seamless player embedding'
  },
  {
    id: 'bizchat',
    name: 'BizChat',
    logo: '/images/logos/BizChat.png',
    role: 'Primary UI',
    description: 'Provides natural language access'
  },
  {
    id: 'teams',
    name: 'Teams',
    logo: '/images/logos/Teams.png',
    role: 'Alternative UI',
    description: 'Delivers within Teams ecosystem'
  },
  {
    id: 'conclusion',
    name: 'True Collaboration',
    logo: '',
    role: '',
    description: 'Together delivering a seamless user experience'
  }
];

/**
 * Chapter 2 - Team Collaboration
 * Demonstrates multi-segment slide with progressive logo reveals
 */
export const Ch2_TeamCollaboration: SlideComponentWithMetadata = () => {
  const { reduced } = useReducedMotion();
  const { currentSegmentIndex, isSegmentVisible } = useSegmentedAnimation();

  const visibleTeams = teams.filter((_, index) => isSegmentVisible(index));
  const currentTeam = teams[currentSegmentIndex];
  const isIntroOrConclusion = currentTeam?.id === 'intro' || currentTeam?.id === 'conclusion';

  return (
    <div
      style={{
        background: '#0f172a',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}
    >
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          color: '#f1f5f9',
          marginBottom: '3rem',
          fontSize: 36,
          textAlign: 'center'
        }}
      >
        Meeting Highlights - Team Collaboration
      </motion.h1>

      {isIntroOrConclusion && (
        <motion.div
          key={currentTeam.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: reduced ? 0.3 : 0.6 }}
          style={{
            textAlign: 'center',
            maxWidth: 600,
            marginBottom: '3rem'
          }}
        >
          <p
            style={{
              color: '#e2e8f0',
              fontSize: 24,
              lineHeight: 1.6
            }}
          >
            {currentTeam.description}
          </p>
        </motion.div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '2rem',
          maxWidth: 900,
          width: '100%'
        }}
      >
        <AnimatePresence mode="popLayout">
          {visibleTeams
            .filter(team => team.logo)
            .map((team) => {
              const isCurrentTeam = team.id === currentTeam?.id;
              
              return (
                <motion.div
                  key={team.id}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{
                    opacity: 1,
                    scale: isCurrentTeam ? 1.05 : 1,
                    y: 0
                  }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{
                    duration: reduced ? 0.3 : 0.6,
                    type: 'spring',
                    stiffness: 100
                  }}
                  style={{
                    background: isCurrentTeam
                      ? 'linear-gradient(135deg, rgba(0, 183, 195, 0.2), rgba(0, 120, 212, 0.2))'
                      : '#1e293b',
                    borderRadius: 16,
                    padding: '2rem',
                    border: isCurrentTeam ? '2px solid #00B7C3' : '1px solid #334155',
                    boxShadow: isCurrentTeam && !reduced
                      ? '0 0 30px rgba(0, 183, 195, 0.4)'
                      : '0 4px 12px rgba(0, 0, 0, 0.3)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    position: 'relative'
                  }}
                >
                  <motion.img
                    src={team.logo}
                    alt={team.name}
                    style={{
                      width: 80,
                      height: 80,
                      objectFit: 'contain',
                      marginBottom: '1rem'
                    }}
                    animate={
                      isCurrentTeam && !reduced
                        ? {
                            scale: [1, 1.1, 1],
                            transition: { duration: 2, repeat: Infinity }
                          }
                        : {}
                    }
                  />

                  <h3
                    style={{
                      color: '#f1f5f9',
                      fontSize: 20,
                      fontWeight: 600,
                      margin: '0.5rem 0'
                    }}
                  >
                    {team.name}
                  </h3>

                  <p
                    style={{
                      color: '#00B7C3',
                      fontSize: 14,
                      fontWeight: 500,
                      margin: '0.25rem 0 0.75rem'
                    }}
                  >
                    {team.role}
                  </p>

                  <AnimatePresence>
                    {isCurrentTeam && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: reduced ? 0.2 : 0.4 }}
                        style={{
                          color: '#94a3b8',
                          fontSize: 13,
                          lineHeight: 1.5,
                          margin: 0
                        }}
                      >
                        {team.description}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  {isCurrentTeam && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                      style={{
                        position: 'absolute',
                        top: -10,
                        right: -10,
                        width: 30,
                        height: 30,
                        borderRadius: '50%',
                        background: '#10b981',
                        border: '3px solid #0f172a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 16,
                        color: '#fff'
                      }}
                    >
                      ✓
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
        </AnimatePresence>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{
          marginTop: '3rem',
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'center'
        }}
      >
        {teams.map((team, index) => (
          <div
            key={team.id}
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: isSegmentVisible(index) ? '#00B7C3' : '#334155',
              border: index === currentSegmentIndex ? '2px solid #f1f5f9' : 'none',
              transition: 'all 0.3s ease'
            }}
          />
        ))}
      </motion.div>
    </div>
  );
};

Ch2_TeamCollaboration.metadata = {
  chapter: 2,
  slide: 1,
  title: 'Team Collaboration',
  srtFilePath: 'highlights_demo/chapters/c2/s1_team_collaboration.srt',
  audioSegments: [
    {
      id: 'intro',
      audioFilePath: '/audio/c2/s1_segment_01_intro.wav',
      narrationText: 'Meeting Highlights brings together six Microsoft teams in a cross-organizational collaboration.'
    },
    {
      id: 'odsp',
      audioFilePath: '/audio/c2/s1_segment_02_odsp.wav',
      narrationText: 'ODSP handles storage and orchestration, initiating highlights generation when recordings are created.'
    },
    {
      id: 'msai',
      audioFilePath: '/audio/c2/s1_segment_03_msai.wav',
      narrationText: 'MSAI-Hive processes meeting transcripts using Large Language Model technology to generate highlight content.'
    },
    {
      id: 'clipchamp',
      audioFilePath: '/audio/c2/s1_segment_04_clipchamp.wav',
      narrationText: 'Clipchamp owns the highlights player component, delivering the visual playback experience.'
    },
    {
      id: 'loop',
      audioFilePath: '/audio/c2/s1_segment_05_loop.wav',
      narrationText: 'Loop enables seamless embedding of the Clipchamp player within different application surfaces.'
    },
    {
      id: 'bizchat',
      audioFilePath: '/audio/c2/s1_segment_06_bizchat.wav',
      narrationText: 'BizChat provides the primary user interface with natural language access to highlights.'
    },
    {
      id: 'teams',
      audioFilePath: '/audio/c2/s1_segment_07_teams.wav',
      narrationText: 'Teams delivers highlights within the Teams ecosystem, sharing the same player technology via Loop.'
    },
    {
      id: 'conclusion',
      audioFilePath: '/audio/c2/s1_segment_08_conclusion.wav',
      narrationText: 'Together, these teams deliver a unified user experience that showcases true Microsoft collaboration.'
    }
  ]
};

/**
 * ============================================================================
 * CHAPTER 7: COST CURVE & QUALITY COMPARISON (from ImpactComponents.tsx)
 * ============================================================================
 */

/**
 * Chapter 7, Slide 3 - Cost Curve
 * Stacked bar comparison showing component cost reduction
 */
export const Ch7_S3_CostCurve: SlideComponentWithMetadata = () => {
  const { reduced } = useReducedMotion();
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
  slide: 3,
  title: "Cost Savings",
  audioSegments: [{
    id: "main",
    audioFilePath: "/audio/c7/s3_segment_01_main.wav",
    narrationText: "Combined, this is estimated to cut COGS by over 70%, enabling economically viable worldwide rollout."
  }]
};

/**
 * Chapter 7, Slide 4 - Quality Comparison
 * Animated qualitative preference shift toward unified prompt outputs
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
  slide: 4,
  title: "Quality Improvement",
  audioSegments: [{
    id: "main",
    audioFilePath: "/audio/c7/s4_segment_01_main.wav",
    narrationText: "The unified prompt produces higher-quality highlights that internal reviewers strongly prefer over the multi-prompt version."
  }]
};

/**
 * ============================================================================
 * EXPORTS
 * ============================================================================
 */

/**
 * Export all animated slides
 */
export const AnimatedSlides = {
  BlankIntro,
  Ch1_S1_WhatIsMeetingHighlights,
  Ch1_S2_HowToAccess,
  Ch1_S3_UserValue,
  Ch2_TeamCollaboration,
  Ch3_S1_ArchitectureOverview,
  Ch4_S1_HighlightTypes,
  Ch5_S1_ChallengeFraming,
  Ch5_S2_FourPrompts,
  Ch5_S3_TopicAbstraction,
  Ch5_S4_ExtractiveSelection,
  Ch5_S5_QualityRanking,
  Ch5_S6_NarrativeSynthesis,
  Ch6_S1_UnifiedConvergence,
  Ch6_S2_UnifiedFlow,
  Ch6_S4_TokenOptimization,
  Ch7_S1_CallReduction,
  Ch7_S2_GPUReduction,
  Ch7_S3_CostCurve,
  Ch7_S4_QualityComparison,
  Ch7_S5_PathToGA,
  Ch8_S1_UserSatisfaction,
  Ch9_S1_Testimonials,
  Ch9_S2_FutureImprovements
};
