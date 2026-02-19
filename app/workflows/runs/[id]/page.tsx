
'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  ReactFlow, 
  Controls, 
  Background, 
  useNodesState, 
  useEdgesState, 
  Node,
  Edge,
  ReactFlowProvider
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle, XCircle, Clock, Terminal } from 'lucide-react';
import { TestNode, ConditionNode, LoopNode, DelayNode, WebhookNode, EndNode, FunctionNode } from '@/app/workflows/components/CustomNodes';

const nodeTypes = {
  testNode: TestNode,
  conditionNode: ConditionNode,
  loopNode: LoopNode,
  delayNode: DelayNode,
  webhookNode: WebhookNode,
  endNode: EndNode,
  functionNode: FunctionNode,
};

function RunDashboard() {
    const { id } = useParams(); // This is Run ID
    const router = useRouter();
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [runDetails, setRunDetails] = useState<any>(null);
    const [executions, setExecutions] = useState<any[]>([]);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

    useEffect(() => {
        if (id) fetchRunDetails();
    }, [id]);

    const fetchRunDetails = async () => {
        try {
            const res = await fetch(`/api/workflows/runs/${id}`);
            const data = await res.json();
            if (data.success) {
                setRunDetails(data.run);
                setExecutions(data.executions);
                
                if (data.definition) {
                    const flow = JSON.parse(data.definition);
                    
                    // Map Status to Node Styles
                    const execMap = new Map(data.executions.map((e: any) => [e.node_id, e]));
                    
                    const styledNodes = (flow.nodes || []).map((node: Node) => {
                        const exec = execMap.get(node.id) as any;
                        let style = { ...node.style };
                        if (exec) {
                            if (exec.status === 'passed') {
                                style.border = '2px solid #22c55e'; // Green
                            } else if (exec.status === 'failed') {
                                style.border = '2px solid #ef4444'; // Red
                            }
                        }
                        return { ...node, style, data: { ...node.data, execution: exec } };
                    });

                    setNodes(styledNodes);
                    setEdges(flow.edges || []);
                }
            }
        } catch (e) {
            console.error("Failed to fetch run", e);
        }
    };

    const onNodeClick = (_: any, node: Node) => {
        setSelectedNodeId(node.id);
    };

    const selectedExecution = executions.find(e => e.node_id === selectedNodeId);

    return (
        <div className="flex h-screen bg-neutral-950 text-neutral-100">
             {/* Sidebar Info */}
             <aside className="w-80 border-r border-neutral-800 bg-neutral-900 flex flex-col">
                <div className="p-4 border-b border-neutral-800 flex items-center gap-2">
                    <button onClick={() => router.push('/workflows')} className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                        <h1 className="font-bold text-sm">Run #{id}</h1>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                            runDetails?.status === 'completed' ? 'bg-green-500/20 text-green-400' : 
                            runDetails?.status === 'failed' ? 'bg-red-500/20 text-red-400' : 
                            'bg-yellow-500/20 text-yellow-400'
                        }`}>
                            {runDetails?.status?.toUpperCase()}
                        </span>
                    </div>
                </div>

                <div className="flex-1 p-4 overflow-y-auto">
                    {selectedNodeId ? (
                        <div className="space-y-4">
                            <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Node Details</h2>
                            <div className="p-3 bg-neutral-800 rounded-lg border border-neutral-700">
                                <p className="text-xs text-neutral-500 mb-1">Node ID</p>
                                <p className="font-mono text-sm">{selectedNodeId}</p>
                            </div>

                            {selectedExecution ? (
                                <>
                                    <div className="p-3 bg-neutral-800 rounded-lg border border-neutral-700">
                                        <p className="text-xs text-neutral-500 mb-1">Status</p>
                                        <div className="flex items-center gap-2">
                                            {selectedExecution.status === 'passed' ? <CheckCircle size={16} className="text-green-500" /> : <XCircle size={16} className="text-red-500" />}
                                            <span className="capitalize">{selectedExecution.status}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="p-3 bg-neutral-800 rounded-lg border border-neutral-700">
                                        <p className="text-xs text-neutral-500 mb-1">Duration</p>
                                        <div className="flex items-center gap-2">
                                            <Clock size={16} className="text-blue-500" />
                                            <span>{selectedExecution.duration}ms</span>
                                        </div>
                                    </div>

                                    {JSON.parse(selectedExecution.artifacts || '{}').trace && (
                                        <div className="p-3 bg-neutral-800 rounded-lg border border-neutral-700">
                                            <p className="text-xs text-neutral-500 mb-1">Trace</p>
                                            <a 
                                                href={JSON.parse(selectedExecution.artifacts || '{}').trace} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-xs font-bold text-blue-400 hover:text-blue-300"
                                            >
                                                <Terminal size={16} />
                                                <span>DOWNLOAD TRACE</span>
                                            </a>
                                        </div>
                                    )}

                                    <div>
                                        <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Logs / Output</p>
                                        <div className="bg-black p-3 rounded-lg font-mono text-xs text-green-400 overflow-x-auto whitespace-pre-wrap max-h-60 border border-neutral-800">
                                            {selectedExecution.error || JSON.stringify(JSON.parse(selectedExecution.output || '{}'), null, 2)}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <p className="text-neutral-500 text-sm italic">This node was not executed or skipped.</p>
                            )}
                        </div>
                    ) : (
                        <p className="text-neutral-500 text-sm text-center mt-10">Select a node to view details.</p>
                    )}
                </div>
             </aside>

             {/* Canvas */}
             <main className="flex-1">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    nodeTypes={nodeTypes}
                    onNodeClick={onNodeClick}
                    fitView
                    nodesDraggable={false}
                    nodesConnectable={false}
                    className="bg-black"
                >
                    <Controls className="!bg-neutral-800 !border-neutral-700 !fill-white" />
                    <Background color="#333" gap={20} />
                </ReactFlow>
             </main>
        </div>
    );
}

export default function RunDashboardPage() {
    return (
        <ReactFlowProvider>
            <RunDashboard />
        </ReactFlowProvider>
    );    
}
