import React from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../accessibility/ReducedMotion';
import { MetricTile } from '../components/CoreComponents';

/**
 * Slide 19 - Challenge Framing
 * BEFORE metrics → TARGET unified approach
 */
export const Slide19Challenge: React.FC = () => {
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

/**
 * Slide 20 - Four Prompt Chain
 */
export const Slide20FourPrompts: React.FC = () => {
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

/**
 * Slide 25 - Unified Convergence
 */
export const Slide25Convergence: React.FC = () => {
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
            <MetricTile label="Success Rate" before="Lower" after="Higher" emphasis note="Improved in local testing" />
          </div>

          <p style={{ color: '#94a3b8', marginTop: '1.5rem', fontSize: 16 }}>
            All stages executed in one inference
          </p>
        </motion.div>
      </div>
    </div>
  );
};

/**
 * Slide 28 - Call Reduction Dial
 */
export const Slide28CallReduction: React.FC = () => {
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
      <div style={{ maxWidth: 600, width: '100%', textAlign: 'center' }}>
        <h1 style={{ color: '#f1f5f9', marginBottom: '3rem' }}>
          LLM Call Reduction
        </h1>

        <svg width="300" height="300" viewBox="0 0 300 300" style={{ margin: '0 auto' }}>
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
            marginTop: '2rem',
            fontSize: 42,
            fontWeight: 'bold',
            color: '#00B7C3'
          }}
        >
          75% Reduction
        </motion.div>

        <p style={{ color: '#94a3b8', marginTop: '1rem', fontSize: 16 }}>
          From 4 sequential calls to 1 unified invocation
        </p>
      </div>
    </div>
  );
};

/**
 * Slide 29 - GPU Reduction
 */
export const Slide29GPUReduction: React.FC = () => {
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

/**
 * Export all animated slides
 */
export const AnimatedSlides = {
  Slide19Challenge,
  Slide20FourPrompts,
  Slide25Convergence,
  Slide28CallReduction,
  Slide29GPUReduction
};