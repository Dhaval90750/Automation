
'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  ReactFlow, 
  Controls, 
  Background, 
  useNodesState, 
  useEdgesState, 
  addEdge, 
  Connection, 
  Edge,
  ReactFlowProvider,
  Node,
  useReactFlow,
  OnSelectionChangeParams
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useRouter, useParams } from 'next/navigation';
import { Save, Play, ArrowLeft, Settings, Database, Loader2, Sparkles, X } from 'lucide-react';
import { TestNode, ConditionNode, LoopNode, DelayNode, WebhookNode, EndNode, FunctionNode } from '@/app/workflows/components/CustomNodes';
import NodeConfigPanel from '@/app/workflows/components/NodeConfigPanel';

const nodeTypes = {
  testNode: TestNode,
  conditionNode: ConditionNode,
  loopNode: LoopNode,
  delayNode: DelayNode,
  webhookNode: WebhookNode,
  endNode: EndNode,
  functionNode: FunctionNode,
};

const initialNodes: Node[] = [
  { id: 'start', type: 'input', position: { x: 250, y: 0 }, data: { label: 'Start' }, style: { background: '#22c55e', color: '#fff', border: 'none', width: 150, borderRadius: '10px' } },
];

function WorkflowBuilder() {
    const { id } = useParams();
    const router = useRouter();
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
    const [workflowName, setWorkflowName] = useState('');
    const [saving, setSaving] = useState(false);
    const [running, setRunning] = useState(false);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [testCases, setTestCases] = useState<any[]>([]);
    const [runStatus, setRunStatus] = useState<string | null>(null);

    // AI State
    const [showAIModal, setShowAIModal] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    // Sidebar Drag & Drop
    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const { screenToFlowPosition } = useReactFlow();

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            const type = event.dataTransfer.getData('application/reactflow');
            if (!type) return;

            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            const newNode: Node = {
                id: `${type}-${Date.now()}`,
                type,
                position,
                data: { label: `${type} node` },
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [screenToFlowPosition, setNodes],
    );
    
    // Connect Edges
    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#a855f7', strokeWidth: 2 } }, eds)),
        [setEdges],
    );

    const onSelectionChange = useCallback(({ nodes }: OnSelectionChangeParams) => {
        if (nodes.length > 0) {
            setSelectedNode(nodes[0]);
        } else {
            setSelectedNode(null);
        }
    }, []);

    const onNodeUpdate = (id: string, data: any) => {
        setNodes((nds) => nds.map((node) => {
            if (node.id === id) {
                return { ...node, data: { ...node.data, ...data } };
            }
            return node;
        }));
        setSelectedNode((prev) => prev ? { ...prev, data: { ...prev.data, ...data } } : null);
    };

    // Initial Load
    useEffect(() => {
        if (id && id !== 'new') fetchWorkflow();
        fetchTestCases();
    }, [id]);

    const fetchTestCases = async () => {
        const res = await fetch('/api/files');
        const json = await res.json();
        if (json.success) setTestCases(json.files);
    };

    const fetchWorkflow = async () => {
        const res = await fetch(`/api/workflows/${id}`);
        const json = await res.json();
        if (json.success && json.workflow) {
            setWorkflowName(json.workflow.name);
            if (json.workflow.definition_json) {
                const flow = JSON.parse(json.workflow.definition_json);
                if (flow.nodes) setNodes(flow.nodes);
                if (flow.edges) setEdges(flow.edges);
            }
        }
    };

    const saveWorkflow = async () => {
        setSaving(true);
        const flow = { nodes, edges };
        try {
            await fetch(`/api/workflows/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    name: workflowName, 
                    definition_json: JSON.stringify(flow) 
                })
            });
        } catch(e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    const runWorkflow = async () => {
        setRunning(true);
        try {
            const res = await fetch(`/api/workflows/${id}/run`, { method: 'POST' });
            const json = await res.json();
            if (json.success) {
                setRunStatus(`Run Started: ID ${json.runId}`);
                alert(`Workflow Run Started! ID: ${json.runId}`);
            } else {
                alert(`Error: ${json.error}`);
            }
        } catch (e: any) {
            alert(`Error: ${e.message}`);
        } finally {
            setRunning(false);
        }
    };

    const handleAIGenerate = async () => {
        if (!aiPrompt) return;
        setIsGenerating(true);
        try {
            const res = await fetch('/api/ai/workflow', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: aiPrompt })
            });
            const data = await res.json();
            if (data.success && data.workflow) {
                // Merge with existing or replace? Replace for now but verify
                 // Reset flow first or merge?
                 // Let's replace nodes but keep ID if possible?
                 // Assuming 'workflow' contains { nodes, edges }
                setNodes(data.workflow.nodes || []);
                setEdges(data.workflow.edges || []);
                setShowAIModal(false);
                setAiPrompt('');
                alert('Workflow generated successfully!');
            } else {
                alert('Failed to generate workflow: ' + (data.error || 'Unknown error'));
            }
        } catch (e: any) {
            alert('Error: ' + e.message);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="flex h-screen bg-neutral-950 text-neutral-100 relative">
            {/* Sidebar */}
            <aside className="w-64 border-r border-neutral-800 bg-neutral-900 flex flex-col z-10">
                <div className="p-4 border-b border-neutral-800 flex items-center space-x-2">
                    <button onClick={() => router.push('/workflows')} className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <input 
                        value={workflowName} 
                        onChange={(e) => setWorkflowName(e.target.value)} 
                        className="bg-transparent font-bold text-sm outline-none w-full" 
                        placeholder="Workflow Name"
                    />
                </div>
                
                <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                    <div className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Components</div>
                    
                    {[
                        { type: 'testNode', label: 'Test Case', icon: Play, color: 'bg-emerald-600' },
                        { type: 'conditionNode', label: 'Condition', icon: Settings, color: 'bg-orange-600' },
                        { type: 'loopNode', label: 'Loop Iterator', icon: Database, color: 'bg-blue-600' },
                        { type: 'delayNode', label: 'Delay', icon: Settings, color: 'bg-neutral-600' },
                        { type: 'functionNode', label: 'Function', icon: Settings, color: 'bg-yellow-600' },
                        { type: 'webhookNode', label: 'Webhook', icon: Settings, color: 'bg-pink-600' },
                        { type: 'endNode', label: 'End Flow', icon: Settings, color: 'bg-red-600' },
                    ].map((node) => (
                        <div 
                            key={node.type}
                            onDragStart={(event) => {
                                event.dataTransfer.setData('application/reactflow', node.type);
                                event.dataTransfer.effectAllowed = 'move';
                            }}
                            draggable
                            className="bg-neutral-800 hover:bg-neutral-700 p-3 rounded-xl border border-neutral-700 hover:border-neutral-600 cursor-grab active:cursor-grabbing flex items-center space-x-3 transition-all"
                        >
                            <div className={`p-1.5 rounded-lg ${node.color}`}>
                                <node.icon className="w-3.5 h-3.5 text-white" />
                            </div>
                            <span className="text-sm font-medium text-neutral-300">{node.label}</span>
                        </div>
                    ))}
                </div>

                <div className="p-4 border-t border-neutral-800 space-y-2">
                    <button 
                        onClick={saveWorkflow} 
                        disabled={saving}
                        className="w-full flex items-center justify-center space-x-2 bg-neutral-800 hover:bg-neutral-700 text-white py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4" />}
                        <span>Save Workflow</span>
                    </button>
                </div>
            </aside>

            {/* Canvas Area */}
            <main className="flex-1 flex flex-col relative h-full">
                {/* Header Toolbar */}
                <header className={`absolute top-4 z-20 flex gap-2 transition-all duration-300 ${selectedNode ? 'right-[21rem]' : 'right-4'}`}>
                    <button 
                        onClick={() => setShowAIModal(true)}
                        className="bg-purple-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-purple-700 flex items-center gap-2 shadow-lg"
                    >
                        <Sparkles size={16} />
                        AI Generate
                    </button>
                    <button 
                        onClick={runWorkflow}
                        disabled={running}
                        className="bg-green-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-green-700 disabled:opacity-50 flex items-center gap-2 shadow-lg"
                    >
                        {running ? <Loader2 className="animate-spin" size={16} /> : <Play size={16} />}
                        {running ? 'Running...' : 'Run'}
                    </button>
                </header>

                <div className="flex-1 h-full" onDrop={onDrop} onDragOver={onDragOver}>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onSelectionChange={onSelectionChange}
                        nodeTypes={nodeTypes}
                        fitView
                        className="bg-black"
                    >
                        <Controls className="!bg-neutral-800 !border-neutral-700 !fill-white" />
                        <Background color="#333" gap={20} />
                    </ReactFlow>
                </div>
            </main>

            {/* Config Panel */}
            <NodeConfigPanel 
                selectedNode={selectedNode} 
                onClose={() => setSelectedNode(null)} 
                onUpdate={onNodeUpdate}
                onDelete={(id) => {
                    setNodes((nds) => nds.filter((n) => n.id !== id));
                    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
                    setSelectedNode(null);
                }}
                testCases={testCases}
            />

            {/* AI Modal */}
            {showAIModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-neutral-900 border border-neutral-700 p-6 rounded-2xl shadow-2xl w-96 relative text-white">
                        <button 
                            onClick={() => setShowAIModal(false)}
                            className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                        
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Sparkles className="text-purple-500" />
                            Generate with AI
                        </h2>
                        
                        <p className="text-neutral-400 text-sm mb-4">
                            Describe your automation workflow in plain English.
                        </p>

                        <textarea
                            className="w-full bg-neutral-950 border border-neutral-800 p-3 rounded-xl mb-4 h-32 text-sm focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                            placeholder="e.g., 'Go to Google, search for React, and verify the page title contains React'"
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                        />
                        
                        <div className="flex justify-end gap-2">
                            <button 
                                onClick={() => setShowAIModal(false)}
                                className="px-4 py-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg text-sm font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleAIGenerate}
                                disabled={isGenerating}
                                className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-purple-500 disabled:opacity-50 flex items-center gap-2 transition-colors"
                            >
                                {isGenerating && <Loader2 className="animate-spin" size={14} />}
                                {isGenerating ? 'Generating...' : 'Generate Workflow'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function BuilderPage() {
    return (
        <ReactFlowProvider>
            <WorkflowBuilder />
        </ReactFlowProvider>
    );
}
