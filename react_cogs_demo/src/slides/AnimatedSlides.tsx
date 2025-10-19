import React from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../accessibility/ReducedMotion';
import { MetricTile } from '../components/CoreComponents';
import { SlideComponentWithMetadata } from './SlideMetadata';

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
  utterance: 0,
  title: "Intro",
  audioFilePath: "/audio/00-Silence.mp3"
};

/**
 * Chapter 5, Utterance 1 - Challenge Framing
 * BEFORE metrics → TARGET unified approach
 */
export const Ch5_U1_ChallengeFraming: SlideComponentWithMetadata = () => {
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

Ch5_U1_ChallengeFraming.metadata = {
  chapter: 5,
  utterance: 1,
  title: "Challenge Framing",
  audioFilePath: "/audio/01-Audio 1.wav"
};

/**
 * Chapter 5, Utterance 2 - Four Prompt Chain
 */
export const Ch5_U2_FourPrompts: SlideComponentWithMetadata = () => {
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

Ch5_U2_FourPrompts.metadata = {
  chapter: 5,
  utterance: 2,
  title: "Four-Prompt Pipeline",
  audioFilePath: "/audio/02-Audio 2.wav"
};

/**
 * Chapter 6, Utterance 1 - Unified Convergence
 */
export const Ch6_U1_UnifiedConvergence: SlideComponentWithMetadata = () => {
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

Ch6_U1_UnifiedConvergence.metadata = {
  chapter: 6,
  utterance: 1,
  title: "Unified Convergence",
  audioFilePath: "/audio/07-Audio 7.wav"
};

/**
 /**
  * Chapter 7, Utterance 1 - Call & Token Reduction
  */
 export const Ch7_U1_CallReduction: SlideComponentWithMetadata = () => {
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
Ch7_U1_CallReduction.metadata = {
  chapter: 7,
  utterance: 1,
  title: "Call Reduction",
  audioFilePath: "/audio/10-Audio 10.wav"
};

/**
 * Chapter 7, Utterance 2 - GPU Reduction
 */
export const Ch7_U2_GPUReduction: SlideComponentWithMetadata = () => {
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

Ch7_U2_GPUReduction.metadata = {
  chapter: 7,
  utterance: 2,
  title: "GPU Optimization",
  audioFilePath: "/audio/11-Audio 11.wav"
};

/**
 * Chapter 5, Utterance 3 - First Prompt: Topic Abstraction
 */
export const Ch5_U3_TopicAbstraction: SlideComponentWithMetadata = () => {
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

Ch5_U3_TopicAbstraction.metadata = {
  chapter: 5,
  utterance: 3,
  title: "Prompt 1: Topic Abstraction",
  audioFilePath: "/audio/03-Audio 3.wav"
};

/**
 * Chapter 5, Utterance 4 - Second Prompt: Extractive Selection
 */
export const Ch5_U4_ExtractiveSelection: SlideComponentWithMetadata = () => {
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

Ch5_U4_ExtractiveSelection.metadata = {
  chapter: 5,
  utterance: 4,
  title: "Prompt 2: Extractive Selection",
  audioFilePath: "/audio/04-Audio 4.wav"
};

/**
 * Chapter 5, Utterance 5 - Third Prompt: Quality Ranking
 */
export const Ch5_U5_QualityRanking: SlideComponentWithMetadata = () => {
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

Ch5_U5_QualityRanking.metadata = {
  chapter: 5,
  utterance: 5,
  title: "Prompt 3: Quality Ranking",
  audioFilePath: "/audio/05-Audio 5.wav"
};

/**
 * Chapter 5, Utterance 6 - Fourth Prompt: Narrative Synthesis
 */
export const Ch5_U6_NarrativeSynthesis: SlideComponentWithMetadata = () => {
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

Ch5_U6_NarrativeSynthesis.metadata = {
  chapter: 5,
  utterance: 6,
  title: "Prompt 4: Narrative Synthesis",
  audioFilePath: "/audio/06-Audio 6.wav"
};

/**
 * Chapter 6, Utterance 2 - Unified Flow Details
 */
export const Ch6_U2_UnifiedFlow: SlideComponentWithMetadata = () => {
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

Ch6_U2_UnifiedFlow.metadata = {
  chapter: 6,
  utterance: 2,
  title: "Unified Flow Details",
  audioFilePath: "/audio/08-Audio 8.wav"
};

/**
 * Chapter 6, Utterance 4 - Token Optimization
 */
export const Ch6_U4_TokenOptimization: SlideComponentWithMetadata = () => {
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

Ch6_U4_TokenOptimization.metadata = {
  chapter: 6,
  utterance: 4,
  title: "Token Optimization",
  audioFilePath: "/audio/09-Audio 9.wav"
};

/**
 * Chapter 7, Utterance 5 - Path to General Availability
 */
export const Ch7_U5_PathToGA: SlideComponentWithMetadata = () => {
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

Ch7_U5_PathToGA.metadata = {
  chapter: 7,
  utterance: 5,
  title: "Path to GA",
  audioFilePath: "/audio/14-Audio 14.wav"
};

/**
 /**
  * Export all animated slides
  */
 export const AnimatedSlides = {
   BlankIntro,
   Ch5_U1_ChallengeFraming,
   Ch5_U2_FourPrompts,
   Ch5_U3_TopicAbstraction,
   Ch5_U4_ExtractiveSelection,
   Ch5_U5_QualityRanking,
   Ch5_U6_NarrativeSynthesis,
   Ch6_U1_UnifiedConvergence,
   Ch6_U2_UnifiedFlow,
   Ch6_U4_TokenOptimization,
   Ch7_U1_CallReduction,
   Ch7_U2_GPUReduction,
   Ch7_U5_PathToGA
 };