import React, { useMemo } from 'react';
import { useReducedMotion, useTheme } from '@framework';
import '@xyflow/react/dist/style.css';
import {
  ReactFlow,
  ReactFlowProvider,
  MarkerType,
  Handle,
  Position,
  type Node as RFNode,
  type Edge as RFEdge,
} from '@xyflow/react';
import Dagre from '@dagrejs/dagre';

interface ExecutionFlowDiagramProps {
  activeNode?: string;
  showLatency?: boolean;
}

interface ServiceCallData {
  id: string;
  label: string;
  latency: number;
  status: 'success' | 'error' | 'pending';
  children?: ServiceCallData[];
}

const CALL_TREE: ServiceCallData = {
  id: 'turing-bot',
  label: 'TuringBot',
  latency: 2847,
  status: 'success',
  children: [
    {
      id: 'connection-to-chat',
      label: 'ConnectionToChatRequest',
      latency: 120,
      status: 'success',
    },
    {
      id: 'chat-hub',
      label: 'ChatHub',
      latency: 2700,
      status: 'success',
      children: [
        { id: 'nlu-direct', label: 'NluDirectResponse', latency: 450, status: 'success' },
        { id: 'runtime-config', label: 'RuntimeConfigProvider', latency: 80, status: 'success' },
        { id: 'deepleo-r1', label: 'DeepLeo-Reasoning-1', latency: 1200, status: 'success' },
        { id: 'substrate-search', label: 'SubstrateSearch', latency: 350, status: 'success' },
        { id: 'deepleo-r2', label: 'DeepLeo-Reasoning-2', latency: 800, status: 'success' },
        { id: 'deepleo-resp', label: 'DeepLeo-Responding', latency: 600, status: 'success' },
      ],
    },
    {
      id: 'telemetry-flush',
      label: 'TelemetryFlush',
      latency: 27,
      status: 'success',
    },
  ],
};

const STATUS_BORDER: Record<string, string> = {
  success: '#34d399',
  error: '#f87171',
  pending: '#6b7280',
};

/* ---------- Flatten tree to nodes/edges ---------- */

function flattenTree(
  node: ServiceCallData,
  parentId?: string,
): { nodes: { id: string; label: string; latency: number; status: string }[]; edges: { source: string; target: string; latency: number }[] } {
  const nodes: { id: string; label: string; latency: number; status: string }[] = [];
  const edges: { source: string; target: string; latency: number }[] = [];

  nodes.push({ id: node.id, label: node.label, latency: node.latency, status: node.status });
  if (parentId) {
    edges.push({ source: parentId, target: node.id, latency: node.latency });
  }
  if (node.children) {
    for (const child of node.children) {
      const sub = flattenTree(child, node.id);
      nodes.push(...sub.nodes);
      edges.push(...sub.edges);
    }
  }
  return { nodes, edges };
}

/* ---------- Custom Node ---------- */

const ServiceNode: React.FC<{ data: Record<string, unknown> }> = ({ data }) => {
  const { reduced } = useReducedMotion();
  const label = data.label as string;
  const latency = data.latency as number;
  const status = data.status as string;
  const isActive = data.isActive as boolean;
  const borderColor = STATUS_BORDER[status] || '#6b7280';
  const nodeId = data.nodeId as string;

  const pulseKeyframes = `
@keyframes svc-pulse-${nodeId} {
  0%, 100% { box-shadow: 0 0 8px ${borderColor}44; }
  50% { box-shadow: 0 0 20px ${borderColor}88, 0 0 40px ${borderColor}44; }
}`;

  return (
    <>
      <Handle type="target" position={Position.Top} id="top" style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} id="bottom" style={{ opacity: 0 }} />
      {isActive && !reduced && <style>{pulseKeyframes}</style>}
      <div
        style={{
          background: isActive
            ? `linear-gradient(135deg, ${borderColor}22, ${borderColor}11)`
            : 'rgba(15,23,42,0.9)',
          border: `2px solid ${isActive ? borderColor : borderColor + '66'}`,
          borderRadius: 10,
          padding: '10px 16px',
          minWidth: 120,
          textAlign: 'center',
          animation: isActive && !reduced
            ? `svc-pulse-${nodeId} 2s ease-in-out infinite`
            : 'none',
        }}
      >
        <div
          style={{
            color: '#e2e8f0',
            fontSize: 12,
            fontWeight: 600,
            fontFamily: "'Cascadia Code', 'Fira Code', Consolas, monospace",
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </div>
        <div
          style={{
            color: borderColor,
            fontSize: 11,
            marginTop: 4,
            fontWeight: 500,
          }}
        >
          {latency}ms
        </div>
      </div>
    </>
  );
};

const nodeTypes = { serviceNode: ServiceNode };

/* ---------- Layout ---------- */

function buildLayout(
  nodes: RFNode[],
  edges: RFEdge[],
): { nodes: RFNode[]; edges: RFEdge[] } {
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'TB', ranksep: 80, nodesep: 40 });

  for (const node of nodes) {
    g.setNode(node.id, { width: 180, height: 60 });
  }
  for (const edge of edges) {
    g.setEdge(edge.source, edge.target);
  }
  Dagre.layout(g);

  const positioned = nodes.map((node) => {
    const pos = g.node(node.id);
    return {
      ...node,
      position: { x: pos.x - 90, y: pos.y - 30 },
    };
  });

  return { nodes: positioned, edges };
}

/* ---------- Main Component ---------- */

export const ExecutionFlowDiagram: React.FC<ExecutionFlowDiagramProps> = ({
  activeNode,
  showLatency = true,
}) => {
  const theme = useTheme();
  const { reduced } = useReducedMotion();

  const { nodes, edges } = useMemo(() => {
    const flat = flattenTree(CALL_TREE);

    const rawNodes: RFNode[] = flat.nodes.map((n) => ({
      id: n.id,
      type: 'serviceNode',
      data: {
        nodeId: n.id,
        label: n.label,
        latency: n.latency,
        status: n.status,
        isActive: n.id === activeNode,
      },
      position: { x: 0, y: 0 },
    }));

    const edgeColor = theme.colors.primary;
    const rawEdges: RFEdge[] = flat.edges.map((e) => {
      const isActive = e.target === activeNode || e.source === activeNode;
      return {
        id: `${e.source}-${e.target}`,
        source: e.source,
        target: e.target,
        type: 'smoothstep',
        animated: !reduced && isActive,
        label: showLatency ? `${e.latency}ms` : undefined,
        labelStyle: {
          fill: 'rgba(203,213,225,0.7)',
          fontSize: 10,
        },
        labelBgStyle: {
          fill: 'rgba(15,23,42,0.8)',
          strokeWidth: 0,
        },
        labelBgPadding: [4, 6] as [number, number],
        labelBgBorderRadius: 4,
        style: {
          stroke: isActive ? '#34d399' : edgeColor,
          strokeWidth: isActive ? 3 : 2,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isActive ? '#34d399' : edgeColor,
        },
      };
    });

    return buildLayout(rawNodes, rawEdges);
  }, [activeNode, showLatency, reduced, theme.colors.primary]);

  return (
    <div style={{ width: '100%', height: 500 }}>
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          panOnDrag={false}
          zoomOnScroll={false}
          zoomOnPinch={false}
          nodesDraggable={false}
          elementsSelectable={false}
          proOptions={{ hideAttribution: true }}
          style={{
            background: theme.colors.bgDeep,
            border: `1px solid ${theme.colors.bgBorder}`,
            borderRadius: 12,
          }}
        />
      </ReactFlowProvider>
    </div>
  );
};
