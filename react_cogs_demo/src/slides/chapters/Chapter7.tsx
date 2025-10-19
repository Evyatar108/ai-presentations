import React from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../../accessibility/ReducedMotion';
import { MetricTile } from '../../components/CoreComponents';
import { SlideComponentWithMetadata } from '../SlideMetadata';

/**
 * Chapter 7: Business Impact
 * 5 slides showing the quantified improvements and path to GA
 */

/**
 * Chapter 7, Slide 1 - Call & Token Reduction
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
 * Chapter 7, Slide 2 - GPU Reduction
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
            ~600 → &lt;200 GPUs
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
    narrationText: "GPU capacity requirements are estimated to have dropped from roughly 600 to less than 200, over 70% reduction."
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
  const fadeUpVar = {
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
        <motion.h2 variants={fadeUpVar} style={{marginTop:0}}>
          Quality Shift: Unified Prompt Preference
        </motion.h2>
        <motion.p
          variants={fadeUpVar}
          style={{fontSize:14, lineHeight:1.5, opacity:0.85}}
        >
          Early internal feedback strongly prefers unified prompt highlight videos over the multi-call pipeline output. Gains center on depth and natural flow.
        </motion.p>
        
        <motion.div
          variants={fadeUpVar}
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
          variants={fadeUpVar}
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
 * Chapter 7, Slide 5 - Path to General Availability
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