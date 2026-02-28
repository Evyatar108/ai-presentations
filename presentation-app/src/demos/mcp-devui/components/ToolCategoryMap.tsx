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

interface ToolCategoryMapProps {
  activeCategory?: string;
  showTools?: boolean;
}

interface CategoryData {
  id: string;
  label: string;
  color: string;
  icon: string;
  tools: string[];
}

const CATEGORIES: CategoryData[] = [
  {
    id: 'navigation',
    label: 'Navigation',
    color: '#3b82f6',
    icon: 'N',
    tools: [
      'load_conversation',
      'load_shared_conversation',
      'load_conversation_from_file',
      'get_turn',
      'get_turn_message',
    ],
  },
  {
    id: 'telemetry',
    label: 'Telemetry',
    color: '#10b981',
    icon: 'T',
    tools: [
      'get_symptom_report',
      'get_turn_telemetry',
      'search_telemetry',
      'search_telemetry_content',
      'get_telemetry_detail',
      'get_execution_flow',
      'get_turn_variants',
      'get_agent_manifest',
      'get_call_flow',
      'get_search_results',
    ],
  },
  {
    id: 'comparison',
    label: 'Comparison',
    color: '#f59e0b',
    icon: 'C',
    tools: ['compare_turns'],
  },
  {
    id: 'chat-execution',
    label: 'Chat Execution',
    color: '#8b5cf6',
    icon: 'X',
    tools: [
      'list_chat_configs',
      'create_chat_config',
      'update_chat_config',
      'send_chat_request',
    ],
  },
  {
    id: 'configuration',
    label: 'Configuration',
    color: '#ef4444',
    icon: 'G',
    tools: [
      'get_sydney_config',
      'list_test_accounts',
      'get_endpoint_status',
    ],
  },
];

/* ---------- Custom Nodes ---------- */

const HubNode: React.FC<{ data: Record<string, unknown> }> = (_props) => {
  const { reduced } = useReducedMotion();

  const glowKeyframes = `
@keyframes hub-glow {
  0%, 100% { box-shadow: 0 0 15px rgba(59,130,246,0.4), 0 0 30px rgba(59,130,246,0.15); }
  50% { box-shadow: 0 0 25px rgba(59,130,246,0.7), 0 0 50px rgba(59,130,246,0.3); }
}`;

  return (
    <>
      <Handle type="source" position={Position.Top} id="top" style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} id="bottom" style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Left} id="left" style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Right} id="right" style={{ opacity: 0 }} />
      {!reduced && <style>{glowKeyframes}</style>}
      <div
        style={{
          width: 130,
          height: 130,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #1e3a5f, #0f172a)',
          border: '2px solid #3b82f6',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          animation: reduced ? 'none' : 'hub-glow 2.5s ease-in-out infinite',
        }}
      >
        <div style={{ color: '#93c5fd', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
          Conversation
        </div>
        <div style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 700, marginTop: 2 }}>
          State
        </div>
      </div>
    </>
  );
};

const CategoryNode: React.FC<{ data: Record<string, unknown> }> = ({ data }) => {
  const { reduced } = useReducedMotion();
  const label = data.label as string;
  const color = data.color as string;
  const icon = data.icon as string;
  const tools = data.tools as string[];
  const toolCount = tools.length;
  const isActive = data.isActive as boolean;
  const showTools = data.showTools as boolean;

  const activeKeyframes = `
@keyframes cat-pulse-${(data.nodeId as string) || 'x'} {
  0%, 100% { box-shadow: 0 0 8px ${color}44, 0 0 16px ${color}22; }
  50% { box-shadow: 0 0 16px ${color}88, 0 0 32px ${color}44; }
}`;

  return (
    <>
      <Handle type="target" position={Position.Top} id="top" style={{ opacity: 0 }} />
      <Handle type="target" position={Position.Bottom} id="bottom" style={{ opacity: 0 }} />
      <Handle type="target" position={Position.Left} id="left" style={{ opacity: 0 }} />
      <Handle type="target" position={Position.Right} id="right" style={{ opacity: 0 }} />
      {isActive && !reduced && <style>{activeKeyframes}</style>}
      <div
        style={{
          background: isActive
            ? `linear-gradient(135deg, ${color}22, ${color}11)`
            : 'rgba(15,23,42,0.85)',
          border: `2px solid ${isActive ? color : color + '55'}`,
          borderRadius: 12,
          padding: '14px 18px',
          minWidth: showTools ? 200 : 140,
          animation: isActive && !reduced
            ? `cat-pulse-${(data.nodeId as string) || 'x'} 2s ease-in-out infinite`
            : 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: showTools ? 8 : 0 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              background: color + '33',
              border: `1px solid ${color}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color,
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            {icon}
          </div>
          <div>
            <div style={{ color: '#e2e8f0', fontSize: 13, fontWeight: 600 }}>{label}</div>
            <div style={{ color: color, fontSize: 11 }}>
              {toolCount} tool{toolCount !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
        {showTools && (
          <div style={{ borderTop: `1px solid ${color}33`, paddingTop: 8, marginTop: 4 }}>
            {tools.map((tool) => (
              <div
                key={tool}
                style={{
                  color: 'rgba(203,213,225,0.8)',
                  fontSize: 10,
                  fontFamily: "'Cascadia Code', 'Fira Code', Consolas, monospace",
                  padding: '2px 0',
                  whiteSpace: 'nowrap',
                }}
              >
                {tool}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

const nodeTypes = {
  hubNode: HubNode,
  categoryNode: CategoryNode,
};

/* ---------- Layout ---------- */

function buildLayout(
  nodes: RFNode[],
  edges: RFEdge[],
): { nodes: RFNode[]; edges: RFEdge[] } {
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'TB', ranksep: 120, nodesep: 60 });

  for (const node of nodes) {
    const w = node.type === 'hubNode' ? 130 : 200;
    const h = node.type === 'hubNode' ? 130 : 80;
    g.setNode(node.id, { width: w, height: h });
  }
  for (const edge of edges) {
    g.setEdge(edge.source, edge.target);
  }
  Dagre.layout(g);

  const positioned = nodes.map((node) => {
    const pos = g.node(node.id);
    const w = node.type === 'hubNode' ? 130 : 200;
    const h = node.type === 'hubNode' ? 130 : 80;
    return {
      ...node,
      position: { x: pos.x - w / 2, y: pos.y - h / 2 },
    };
  });

  return { nodes: positioned, edges };
}

/* ---------- Main Component ---------- */

export const ToolCategoryMap: React.FC<ToolCategoryMapProps> = ({
  activeCategory,
  showTools = false,
}) => {
  const theme = useTheme();
  const { reduced } = useReducedMotion();

  const { nodes, edges } = useMemo(() => {
    const rawNodes: RFNode[] = [
      {
        id: 'hub',
        type: 'hubNode',
        data: {},
        position: { x: 0, y: 0 },
      },
      ...CATEGORIES.map((cat) => ({
        id: cat.id,
        type: 'categoryNode',
        data: {
          nodeId: cat.id,
          label: cat.label,
          color: cat.color,
          icon: cat.icon,
          tools: cat.tools,
          isActive: cat.id === activeCategory,
          showTools,
        },
        position: { x: 0, y: 0 },
      })),
    ];

    const rawEdges: RFEdge[] = CATEGORIES.map((cat) => ({
      id: `hub-${cat.id}`,
      source: 'hub',
      target: cat.id,
      type: 'smoothstep',
      animated: !reduced && cat.id === activeCategory,
      style: {
        stroke: cat.id === activeCategory ? cat.color : cat.color + '55',
        strokeWidth: cat.id === activeCategory ? 3 : 2,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: cat.id === activeCategory ? cat.color : cat.color + '55',
      },
    }));

    return buildLayout(rawNodes, rawEdges);
  }, [activeCategory, showTools, reduced]);

  return (
    <div style={{ width: '100%', height: 500 }}>
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
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
