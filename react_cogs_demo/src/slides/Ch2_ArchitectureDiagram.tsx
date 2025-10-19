import React, { useMemo } from 'react';
import { useReducedMotion } from '../accessibility/ReducedMotion';
import {
  ReactFlow,
  Background,
  Controls,
  ReactFlowProvider,
  MarkerType,
  Node as RFNode,
  Edge as RFEdge,
  Handle,
  Position
} from 'reactflow';

interface ArchitectureDiagramProps {
  currentSegmentIndex: number;
  isSegmentVisible: (index: number) => boolean;
  currentTeamId?: string;
  reduced: boolean;
}

/**
 * Node renderer component - defined outside to prevent React Flow warnings
 */
const NodeRenderer: React.FC<{ data: any }> = ({ data }) => {
  return (
    <>
      {/* Connection handles for edges - with IDs for explicit control */}
      <Handle id="top" type="target" position={Position.Top} style={{ opacity: 0 }} />
      <Handle id="left" type="target" position={Position.Left} style={{ opacity: 0 }} />
      <Handle id="right" type="target" position={Position.Right} style={{ opacity: 0 }} />
      <Handle id="bottom" type="target" position={Position.Bottom} style={{ opacity: 0 }} />
      <Handle id="top" type="source" position={Position.Top} style={{ opacity: 0 }} />
      <Handle id="left" type="source" position={Position.Left} style={{ opacity: 0 }} />
      <Handle id="right" type="source" position={Position.Right} style={{ opacity: 0 }} />
      <Handle id="bottom" type="source" position={Position.Bottom} style={{ opacity: 0 }} />
      
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div
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
          <img
            src={data.logo}
            alt={data.label}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>
        <div style={{ color: '#f1f5f9', fontSize: 14, fontWeight: 600 }}>{data.label}</div>
        <div style={{ color: '#00B7C3', fontSize: 11, marginTop: 2 }}>{data.role}</div>
      </div>
    </>
  );
};

const nodeTypes = { archNode: NodeRenderer };

/**
 * ReactFlow architecture diagram with progressive reveal.
 * Segment indices:
 * 0 intro, 1 ODSP, 2 MSAI-Hive, 3 Clipchamp, 4 Loop, 5 BizChat, 6 Teams, 7 conclusion
 */
export const Ch2_ArchitectureDiagram: React.FC<ArchitectureDiagramProps> = ({
  currentSegmentIndex,
  isSegmentVisible,
  currentTeamId,
  reduced
}) => {
  const nodeVisible = (seg: number) => isSegmentVisible(seg);

  // Spread nodes for clearer edge visibility
  // Spread nodes for clearer edge visibility - ODSP moved up, nodes repositioned to avoid edge intersections
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
      position: { x: 400, y: 120 }  // Moved up from y: 200
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
      position: { x: 100, y: 20 }  // Adjusted for better flow
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
      position: { x: 150, y: 420 }
    },
    {
      id: 'teams',
      type: 'archNode',
      data: {
        label: 'Teams',
        role: 'Planned UI',
        logo: '/images/logos/Teams.png',
        segment: 4
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
        segment: 5
      },
      position: { x: 400, y: 320 }
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
      data: { segment: 3 }
    },
    {
      id: 'teams-loop',
      source: 'teams',
      sourceHandle: 'top',
      target: 'loop',
      targetHandle: 'right',
      label: '(2) Requests player',
      data: { segment: 4 }
    },
    {
      id: 'loop-clipchamp',
      source: 'loop',
      sourceHandle: 'top',
      target: 'clipchamp',
      targetHandle: 'bottom',
      label: '(3) Embeds iFrame',
      data: { segment: 5 }
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
          // Only show edges where both nodes are visible
          const sourceVisible = nodes.find(n => n.id === e.source);
          const targetVisible = nodes.find(n => n.id === e.target);
          // And edge's segment is visible
          const edgeSegment = (e.data as any)?.segment || 0;
          return sourceVisible && targetVisible && isSegmentVisible(edgeSegment);
        })
        .map(e => {
          const labelText = typeof e.label === 'string' ? e.label : '';
          const edgeSegment = (e.data as any)?.segment || 0;
          const edgeId = e.id;
          
          // Special cases for active edges in later segments
          // Segment 5 (when Clipchamp appears): animate both "Requests player" arrows (bizchat-loop, teams-loop)
          // Segment 6 (when last node appears): animate only "Embeds iFrame", NOT "Fetches data"
          // Segment 7 (conclusion): all arrows static
          const isRequestsPlayer = edgeId === 'bizchat-loop' || edgeId === 'teams-loop';
          const isLoopClipchamp = edgeId === 'loop-clipchamp';
          const isClipchampOdsp = edgeId === 'clipchamp-odsp';
          
          const shouldAnimate =
            (edgeSegment === currentSegmentIndex) || // Normal: animate when first revealed
            (currentSegmentIndex === 5 && isRequestsPlayer) || // Segment 5: animate request player arrows
            (currentSegmentIndex === 6 && isLoopClipchamp); // Segment 6: animate ONLY embeds iframe, not fetches data
          
          // Determine if edge should show as "active" (blue) even if not animated
          const isActiveEdge = shouldAnimate ||
            (currentSegmentIndex === 6 && isClipchampOdsp); // Show fetches data as active but not animated in segment 6
          
          // Blue when active/highlighted, otherwise use type-based color
          const strokeColor = isActiveEdge ? '#0078D4' : '#00B7C3';
          
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
    [nodes, reduced, currentSegmentIndex, isSegmentVisible]
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

