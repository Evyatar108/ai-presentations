import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '../../accessibility/ReducedMotion';
import { useSegmentedAnimation } from '../../contexts/SegmentContext';
import { SlideComponentWithMetadata } from '../SlideMetadata';
import { Ch2_ArchitectureDiagram } from '../Ch2_ArchitectureDiagram';

/**
 * Chapter 2: Team Collaboration
 * Single slide showing team collaboration and architecture flow
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
    id: 'loop',
    name: 'Loop',
    logo: '/images/logos/Loop.png',
    role: 'Integration Layer',
    description: 'Enables seamless player embedding'
  },
  {
    id: 'clipchamp',
    name: 'Clipchamp',
    logo: '/images/logos/ClipChamp.png',
    role: 'Video Player',
    description: 'Owns the highlights player component'
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
* Chapter 2 - Team Collaboration & Architecture
* Merged slide showing team collaboration diagram (left) and architecture flow (right)
*/
export const Ch2_TeamCollaboration: SlideComponentWithMetadata = () => {
 const { reduced } = useReducedMotion();
 const { currentSegmentIndex, isSegmentVisible } = useSegmentedAnimation();

 const currentTeam = teams[currentSegmentIndex];
 const isIntroSegment = currentTeam?.id === 'intro';
 const shouldShowDualView = currentSegmentIndex >= 1; // Show both diagrams from segment 1 onwards

 // Architecture flow steps that progressively reveal
 const archFlowSteps = [
   { id: 'recording', icon: '📹', label: 'Teams Recording', desc: 'Meeting ends, event triggered', segment: 1 },
   { id: 'odsp-init', icon: '🗄️', label: 'ODSP', desc: 'Initiates highlight generation', segment: 2 },
   { id: 'tmr', icon: '⚙️', label: 'TMR Processor', desc: 'Calls LLM with transcript', segment: 3 },
   { id: 'llm', icon: '🤖', label: 'LLM Analysis', desc: 'Returns highlights metadata', segment: 3 },
   { id: 'acs', icon: '🎙️', label: 'Azure Cognitive Services', desc: 'Generates narration audio', segment: 4 },
   { id: 'bizchat', icon: '💬', label: 'BizChat Access', desc: 'Natural language interface', segment: 5 },
   { id: 'storage', icon: '✅', label: 'Storage & Access', desc: 'Available via BizChat and Teams', segment: 6 }
 ];

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
         marginBottom: '2rem',
         fontSize: 36,
         textAlign: 'center'
       }}
     >
       Meeting Highlights - Team Collaboration & Architecture
     </motion.h1>

     {isIntroSegment && (
       <motion.div
         key={currentTeam.id}
         initial={{ opacity: 0, scale: 0.9 }}
         animate={{ opacity: 1, scale: 1 }}
         exit={{ opacity: 0, scale: 0.9 }}
         transition={{ duration: reduced ? 0.3 : 0.6 }}
         style={{
           textAlign: 'center',
           maxWidth: 800,
           marginBottom: '2rem'
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

     {/* Dual view: ReactFlow diagram (left) + Architecture flow (right) */}
     <AnimatePresence mode="wait">
       {shouldShowDualView && (
         <motion.div
           key="dual-view"
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           exit={{ opacity: 0, scale: 0.95 }}
           transition={{ duration: reduced ? 0.3 : 0.6 }}
           style={{
             display: 'grid',
             gridTemplateColumns: '1.2fr 1fr',
             gap: '2rem',
             width: '100%',
             maxWidth: 1400,
             alignItems: 'start'
           }}
         >
           {/* Left: ReactFlow Team Diagram */}
           <div>
             <Ch2_ArchitectureDiagram
               currentSegmentIndex={currentSegmentIndex}
               isSegmentVisible={isSegmentVisible}
               currentTeamId={currentTeam?.id}
               reduced={reduced}
             />
           </div>

           {/* Right: Architecture Flow */}
           <div
             style={{
               background: '#1e293b',
               borderRadius: 16,
               padding: '1.5rem',
               border: '1px solid #334155',
               height: '500px',
               overflowY: 'auto'
             }}
           >
             <h2 style={{ color: '#f1f5f9', fontSize: 20, marginTop: 0, marginBottom: '1.5rem' }}>
               Backend Flow
             </h2>
             
             {archFlowSteps.map((step, index) => {
               const isVisible = isSegmentVisible(step.segment);
               const isCurrent = step.segment === currentSegmentIndex;
               
               return (
                 <AnimatePresence key={step.id}>
                   {isVisible && (
                     <motion.div
                       initial={{ opacity: 0, x: -20 }}
                       animate={{ opacity: 1, x: 0 }}
                       exit={{ opacity: 0, x: -20 }}
                       transition={{ duration: reduced ? 0.3 : 0.5, delay: reduced ? 0 : index * 0.05 }}
                       style={{
                         display: 'flex',
                         alignItems: 'center',
                         gap: '1rem',
                         marginBottom: '1rem',
                         padding: '1rem',
                         background: isCurrent
                           ? 'linear-gradient(135deg, rgba(0, 183, 195, 0.2), rgba(0, 120, 212, 0.2))'
                           : 'rgba(0, 183, 195, 0.1)',
                         borderRadius: 8,
                         border: isCurrent ? '2px solid #00B7C3' : 'none',
                         boxShadow: isCurrent && !reduced ? '0 0 20px rgba(0, 183, 195, 0.3)' : 'none'
                       }}
                     >
                       <div style={{ fontSize: 28, flexShrink: 0 }}>{step.icon}</div>
                       <div style={{ flex: 1 }}>
                         <div style={{ color: '#f1f5f9', fontWeight: 600, fontSize: 14 }}>{step.label}</div>
                         <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 2 }}>{step.desc}</div>
                       </div>
                       {index < archFlowSteps.length - 1 && (
                         <div style={{ color: '#00B7C3', fontSize: 20 }}>↓</div>
                       )}
                     </motion.div>
                   )}
                 </AnimatePresence>
               );
             })}
           </div>
         </motion.div>
       )}
     </AnimatePresence>

     <motion.div
       initial={{ opacity: 0 }}
       animate={{ opacity: 1 }}
       transition={{ delay: 0.5 }}
       style={{
         marginTop: '2rem',
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
  title: 'Team Collaboration & Architecture',
  srtFilePath: 'highlights_demo/chapters/c2/s1_team_collaboration.srt',
  audioSegments: [
    {
      id: 'intro',
      audioFilePath: '/audio/c2/s1_segment_01_intro.wav',
      narrationText: 'Meeting Highlights brings together six Microsoft teams in a cross-organizational collaboration. Let me show you both how teams work together and the backend architecture flow.'
    },
    {
      id: 'odsp',
      audioFilePath: '/audio/c2/s1_segment_02_odsp.wav',
      narrationText: 'O-D-S-P handles storage and orchestration. When a Teams meeting ends with a recording, ODSP detects it and initiates the highlight generation process.'
    },
    {
      id: 'msai',
      audioFilePath: '/audio/c2/s1_segment_03_msai.wav',
      narrationText: 'M-S-A-I Hive processes meeting transcripts using Large Language Model technology. Our processor receives the transcript and calls the LLM with our prompts, which analyzes the content and returns structured metadata describing the highlights.'
    },
    {
      id: 'acs',
      audioFilePath: '/audio/c2/s1_segment_04_acs.wav',
      narrationText: 'We use Azure Cognitive Services to convert the narration text into natural-sounding audio using text-to-speech technology.'
    },
    {
      id: 'bizchat',
      audioFilePath: '/audio/c2/s1_segment_05_bizchat.wav',
      narrationText: 'BizChat provides the primary user interface with natural language access to highlights through conversational queries.'
    },
    {
      id: 'loop_storage',
      audioFilePath: '/audio/c2/s1_segment_06_loop.wav',
      narrationText: 'Loop enables seamless embedding of the Clipchamp player within different application surfaces. All metadata, audio, and captions are securely stored in ODSP and made available through BizChat and Teams.'
    },
    {
      id: 'clipchamp',
      audioFilePath: '/audio/c2/s1_segment_07_clipchamp.wav',
      narrationText: 'Clipchamp owns the highlights player component, delivering the rich visual playback experience users see, without requiring us to create a new video file.'
    },
    {
      id: 'conclusion',
      audioFilePath: '/audio/c2/s1_segment_08_conclusion.wav',
      narrationText: 'Together, these teams deliver a unified end-to-end experience from recording through AI processing to user access, showcasing true Microsoft collaboration.'
    }
  ]
};