import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '../../accessibility/ReducedMotion';
import { useSegmentedAnimation } from '../../contexts/SegmentContext';
import { SlideComponentWithMetadata } from '../SlideMetadata';

/**
 * Chapter 3: Architecture Overview
 * Single slide showing the backend architecture flow
 */

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
      narrationText: "O-D-S-P, our storage and orchestration layer, detects the recording and initiates the highlight generation process."
    },
    {
      id: "tmr",
      audioFilePath: "/audio/c3/s1_segment_04_tmr.wav",
      srtSegmentNumber: 4,
      visualDescription: "TMR Processor component highlights with arrow from ODSP",
      narrationText: "The M-S-A-I processor receives the meeting transcript and calls the LLM using our prompts."
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
      narrationText: "Finally, all the metadata, audio, and captions are securely stored in ODSP and made available to users through BizChat and Teams."
    }
  ]
};