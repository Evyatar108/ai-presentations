import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '../../accessibility/ReducedMotion';
import { useSegmentedAnimation } from '../../contexts/SegmentContext';
import { SlideComponentWithMetadata } from '../SlideMetadata';
import {
  ReactFlow,
  Background,
  ReactFlowProvider,
  MarkerType,
  Node as RFNode,
  Edge as RFEdge,
  Handle,
  Position
} from 'reactflow';

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
    id: 'sharepoint',
    name: 'SharePoint',
    logo: '/images/logos/sharepoint.png',
    role: 'Web UI',
    description: 'Direct access from meeting recap page'
  },
  {
    id: 'teams',
    name: 'Teams',
    logo: '/images/logos/Teams.png',
    role: 'Planned UI',
    description: 'Planned interface within Teams ecosystem'
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
 * Node renderer component for ReactFlow diagram
 */
const NodeRenderer: React.FC<{ data: any }> = ({ data }) => {
  const isCurrent = data.isCurrent;
  
  return (
    <>
      {/* Connection handles for edges */}
      <Handle id="top" type="target" position={Position.Top} style={{ opacity: 0 }} />
      <Handle id="left" type="target" position={Position.Left} style={{ opacity: 0 }} />
      <Handle id="right" type="target" position={Position.Right} style={{ opacity: 0 }} />
      <Handle id="bottom" type="target" position={Position.Bottom} style={{ opacity: 0 }} />
      <Handle id="top" type="source" position={Position.Top} style={{ opacity: 0 }} />
      <Handle id="left" type="source" position={Position.Left} style={{ opacity: 0 }} />
      <Handle id="right" type="source" position={Position.Right} style={{ opacity: 0 }} />
      <Handle id="bottom" type="source" position={Position.Bottom} style={{ opacity: 0 }} />
      
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{
          scale: isCurrent ? 1.05 : 1,
          opacity: 1
        }}
        transition={{
          duration: 0.4,
          type: 'spring',
          stiffness: 200,
          damping: 15
        }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      >
        <motion.div
          animate={isCurrent ? {
            boxShadow: [
              '0 2px 6px rgba(0,0,0,0.25)',
              '0 4px 20px rgba(0,183,195,0.6)',
              '0 2px 6px rgba(0,0,0,0.25)'
            ]
          } : {}}
          transition={{ duration: 1.5, repeat: isCurrent ? Infinity : 0 }}
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 6,
            boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
            padding: 6
          }}
        >
          <motion.img
            src={data.logo}
            alt={data.label}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              duration: 0.6,
              type: 'spring',
              delay: 0.1
            }}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          style={{ color: '#f1f5f9', fontSize: 14, fontWeight: 600 }}
        >
          {data.label}
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          style={{ color: '#00B7C3', fontSize: 11, marginTop: 2 }}
        >
          {data.role}
        </motion.div>
      </motion.div>
    </>
  );
};

const nodeTypes = { archNode: NodeRenderer };

/**
 * Architecture Diagram Component (inline)
 */
const ArchitectureDiagram: React.FC<{
  currentSegmentIndex: number;
  isSegmentVisible: (index: number) => boolean;
  currentTeamId?: string;
  reduced: boolean;
}> = ({ currentSegmentIndex, isSegmentVisible, currentTeamId, reduced }) => {
  const nodeVisible = (seg: number) => isSegmentVisible(seg);

  const baseNodes: RFNode[] = [
    {
      id: 'odsp',
      type: 'archNode',
      data: {
        label: 'ODSP',
        role: 'Storage & Orchestration',
        logo: '/images/logos/odsp.png',
        segment: 1
      },
      position: { x: 400, y: 100 }
    },
    {
      id: 'msai',
      type: 'archNode',
      data: {
        label: 'MSAI-Hive',
        role: 'AI Generation',
        logo: '/images/logos/msai-hive.png',
        segment: 2
      },
      position: { x: 100, y: 10 }
    },
    {
      id: 'bizchat',
      type: 'archNode',
      data: {
        label: 'BizChat',
        role: 'Primary UI',
        logo: '/images/logos/BizChat.png',
        segment: 3
      },
      position: { x: 100, y: 420 }
    },
    {
      id: 'sharepoint',
      type: 'archNode',
      data: {
        label: 'SharePoint',
        role: 'Web UI',
        logo: '/images/logos/sharepoint.png',
        segment: 4
      },
      position: { x: 400, y: 460 }
    },
    {
      id: 'teams',
      type: 'archNode',
      data: {
        label: 'Teams',
        role: 'Planned UI',
        logo: '/images/logos/Teams.png',
        segment: 5
      },
      position: { x: 650, y: 420 }
    },
    {
      id: 'loop',
      type: 'archNode',
      data: {
        label: 'Loop',
        role: 'Integration Layer',
        logo: '/images/logos/Loop.png',
        segment: 6
      },
      position: { x: 400, y: 280 }
    },
    {
      id: 'clipchamp',
      type: 'archNode',
      data: {
        label: 'Clipchamp',
        role: 'Video Player',
        logo: '/images/logos/ClipChamp.png',
        segment: 6
      },
      position: { x: 700, y: 120 }
    }
  ];

  const nodes: RFNode[] = useMemo(
    () =>
      baseNodes
        .filter(n => nodeVisible((n.data as any).segment))
        .map(n => {
          const isCurrent = n.id === currentTeamId;
          return {
            ...n,
            style: {
              borderRadius: 14,
              padding: 8,
              width: 160,
              background: isCurrent
                ? 'linear-gradient(135deg, rgba(0,183,195,0.25), rgba(0,120,212,0.25))'
                : '#1e293b',
              border: isCurrent ? '2px solid #00B7C3' : '1px solid #334155',
              boxShadow: isCurrent && !reduced ? '0 0 22px rgba(0,183,195,0.4)' : '0 2px 6px rgba(0,0,0,0.4)'
            },
            data: {
              ...(n.data as any),
              isCurrent
            }
          } as RFNode;
        }),
    [baseNodes, currentTeamId, reduced, currentSegmentIndex]
  );

  const baseEdges: RFEdge[] = [
    {
      id: 'odsp-msai',
      source: 'odsp',
      sourceHandle: 'top',
      target: 'msai',
      targetHandle: 'right',
      label: '(1) Generate Highlights',
      data: { segment: 2 }
    },
    {
      id: 'bizchat-loop',
      source: 'bizchat',
      sourceHandle: 'top',
      target: 'loop',
      targetHandle: 'left',
      label: '(2) Requests player',
      data: { segment: 6 }
    },
    {
      id: 'sharepoint-loop',
      source: 'sharepoint',
      sourceHandle: 'top',
      target: 'loop',
      targetHandle: 'bottom',
      label: '(2) Requests player',
      data: { segment: 6 }
    },
    {
      id: 'teams-loop',
      source: 'teams',
      sourceHandle: 'top',
      target: 'loop',
      targetHandle: 'right',
      label: '(2) Requests player',
      data: { segment: 6 }
    },
    {
      id: 'loop-clipchamp',
      source: 'loop',
      sourceHandle: 'top',
      target: 'clipchamp',
      targetHandle: 'bottom',
      label: '(3) Embeds iFrame',
      data: { segment: 6 }
    },
    {
      id: 'clipchamp-odsp',
      source: 'clipchamp',
      sourceHandle: 'left',
      target: 'odsp',
      targetHandle: 'right',
      label: '(4) Fetches data',
      data: { segment: 6 }
    }
  ];

  const edges: RFEdge[] = useMemo(
    () =>
      baseEdges
        .filter(e => {
          const sourceVisible = nodes.find(n => n.id === e.source);
          const targetVisible = nodes.find(n => n.id === e.target);
          const edgeSegment = (e.data as any)?.segment || 0;
          return sourceVisible && targetVisible && isSegmentVisible(edgeSegment);
        })
        .map(e => {
          const labelText = typeof e.label === 'string' ? e.label : '';
          const edgeSegment = (e.data as any)?.segment || 0;
          const edgeId = e.id;
          
          const isRequestsPlayer = edgeId === 'bizchat-loop' || edgeId === 'sharepoint-loop' || edgeId === 'teams-loop';
          const isLoopClipchamp = edgeId === 'loop-clipchamp';
          const isClipchampOdsp = edgeId === 'clipchamp-odsp';
          
          const shouldAnimate =
            (edgeSegment === currentSegmentIndex) ||
            (currentSegmentIndex === 6 && isRequestsPlayer) ||
            (currentSegmentIndex === 7 && (isLoopClipchamp || isClipchampOdsp));
          
          const strokeColor = shouldAnimate ? '#0078D4' : '#00B7C3';
          
          return {
            ...e,
            type: 'smoothstep',
            animated: !reduced && shouldAnimate,
            style: {
              stroke: strokeColor,
              strokeWidth: 3,
              strokeDasharray: undefined
            },
            label: labelText,
            labelStyle: {
              fill: '#e2e8f0',
              fontSize: 11,
              fontWeight: 600
            },
            labelBgStyle: {
              fill: 'rgba(15,23,42,0.8)',
              strokeWidth: 1
            },
            labelBgPadding: [6, 8] as [number, number],
            labelBgBorderRadius: 4,
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: strokeColor
            }
          } as RFEdge;
        }),
    [baseEdges, nodes, reduced, currentSegmentIndex, isSegmentVisible]
  );

  return (
    <div style={{ width: 660, height: 500, margin: '0 auto' }}>
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          defaultViewport={{ x: -55, y: 20, zoom: 0.80 }}
          minZoom={0.3}
          maxZoom={0.8}
          panOnDrag={false}
          zoomOnScroll={false}
          zoomOnPinch={false}
          nodesDraggable={false}
          elementsSelectable={false}
          proOptions={{ hideAttribution: true }}
          defaultEdgeOptions={{
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#00B7C3'
            }
          }}
          style={{
            background: '#0f172a',
            border: '1px solid #334155',
            borderRadius: 12
          }}
        >
          <Background color="#1e293b" gap={32} />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
};

/**
* Chapter 2 - Team Collaboration & Architecture
* Merged slide showing team collaboration diagram (left) and architecture flow (right)
*/
export const Ch2_TeamCollaboration: SlideComponentWithMetadata = () => {
 const { reduced } = useReducedMotion();
 const { currentSegmentIndex, isSegmentVisible } = useSegmentedAnimation();
 const backendFlowRef = React.useRef<HTMLDivElement>(null);

 const currentTeam = teams[currentSegmentIndex];
 const isIntroSegment = currentTeam?.id === 'intro';
 const shouldShowDualView = currentSegmentIndex >= 1; // Show both diagrams from segment 1 onwards

 // Auto-scroll backend flow to bottom when new items appear
 React.useEffect(() => {
   if (backendFlowRef.current && shouldShowDualView) {
     backendFlowRef.current.scrollTop = backendFlowRef.current.scrollHeight;
   }
 }, [currentSegmentIndex, shouldShowDualView]);
  // Architecture flow steps that progressively reveal - aligned with narration
  // Segments: 0=intro, 1=ODSP, 2=MSAI, 3=BizChat, 4=SharePoint, 5=Teams, 6=Loop, 7=Clipchamp, 8=conclusion
  const archFlowSteps = [
    { id: 'recording', icon: '📹', label: 'Teams Recording', desc: 'Meeting ends, event triggered', segment: 1 },
    { id: 'odsp-init', icon: '🗄️', label: 'ODSP', desc: 'Initiates highlight generation', segment: 1 },
    { id: 'tmr', icon: '⚙️', label: 'MSAI Processor', desc: 'Calls LLM with transcript', segment: 2 },
    { id: 'llm', icon: '🤖', label: 'LLM Analysis', desc: 'Returns highlights metadata', segment: 2 },
    { id: 'bizchat', icon: '💬', label: 'BizChat Access', desc: 'Natural language interface', segment: 3 },
    { id: 'sharepoint-access', icon: '🌐', label: 'SharePoint Access', desc: 'Direct web interface', segment: 4 },
    { id: 'teams-access', icon: '👥', label: 'Teams Access', desc: 'Planned interface option', segment: 5 },
    { id: 'loop', icon: '🔗', label: 'Loop Integration', desc: 'Embeds player component', segment: 6 },
    { id: 'clipchamp', icon: '🎬', label: 'Clipchamp Player', desc: 'Delivers playback experience', segment: 7 }
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
             <ArchitectureDiagram
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
               border: '1px solid #334155',
               height: '500px',
               display: 'flex',
               flexDirection: 'column'
             }}
           >
             <h2 style={{
               color: '#f1f5f9',
               fontSize: 20,
               margin: 0,
               padding: '1.5rem 1.5rem 1rem',
               borderBottom: '1px solid #334155',
               flexShrink: 0
             }}>
               Backend Flow
             </h2>
             <div
               ref={backendFlowRef}
               style={{
                 flex: 1,
                 overflowY: 'auto',
                 scrollBehavior: 'smooth',
                 padding: '1rem 1.5rem 1.5rem'
               }}
             >
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
      narrationText: 'Meeting Highlights required the collaboration of six teams within Microsoft for a cross-organizational effort. Let me show you how each team contribute to the project through the architecture.'
    },
    {
      id: 'odsp',
      audioFilePath: '/audio/c2/s1_segment_02_odsp.wav',
      narrationText: 'ODSP handles storage. When meetings end, it initiates highlight generation.'
    },
    {
      id: 'msai',
      audioFilePath: '/audio/c2/s1_segment_03_msai.wav',
      narrationText: 'MSAI-Hive processes transcripts using LLMs to generate highlight metadata.'
    },
    {
      id: 'bizchat',
      audioFilePath: '/audio/c2/s1_segment_04_bizchat.wav',
      narrationText: 'BizChat provides natural language access through conversational queries.'
    },
    {
      id: 'sharepoint',
      audioFilePath: '/audio/c2/s1_segment_05_sharepoint.wav',
      narrationText: 'SharePoint offers direct access from meeting recap pages. This interface was implemented by the Clipchamp team.'
    },
    {
      id: 'teams',
      audioFilePath: '/audio/c2/s1_segment_06_teams.wav',
      narrationText: 'Teams access planned as another interface option.'
    },
    {
      id: 'loop_storage',
      audioFilePath: '/audio/c2/s1_segment_07_loop_storage.wav',
      narrationText: 'Loop embeds the Clipchamp player across applications.'
    },
    {
      id: 'clipchamp',
      audioFilePath: '/audio/c2/s1_segment_08_clipchamp.wav',
      narrationText: 'Clipchamp delivers the player experience without creating new video files.'
    },
    {
      id: 'conclusion',
      audioFilePath: '/audio/c2/s1_segment_09_conclusion.wav',
      narrationText: 'Together delivering end-to-end experience—true Microsoft collaboration.'
    }
  ]
};