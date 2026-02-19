
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
    Layout, Plus, Trash2, Edit, Play, MoreVertical, 
    Search, Workflow as WorkflowIcon, Loader2, Clock
} from 'lucide-react';
import { Workflow } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

export default function WorkflowsPage() {
    const router = useRouter();
    const [workflows, setWorkflows] = useState<Workflow[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchWorkflows();
    }, []);

    const fetchWorkflows = async () => {
        try {
            const res = await fetch('/api/workflows');
            const json = await res.json();
            if (json.success) {
                setWorkflows(json.workflows);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const createWorkflow = async () => {
        const name = prompt('Workflow Name:');
        if (!name) return;

        const description = prompt('Description (optional):');

        // Default empty workflow definition
        const definition_json = JSON.stringify({ nodes: [], edges: [] });

        const res = await fetch('/api/workflows', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, description, definition_json })
        });

        const json = await res.json();
        if (json.success) {
            router.push(`/workflows/builder/${json.id}`);
        } else {
            alert('Error: ' + json.error);
        }
    };

    const deleteWorkflow = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this workflow?')) return;
        
        await fetch(`/api/workflows/${id}`, { method: 'DELETE' });
        fetchWorkflows();
    };

    const filteredWorkflows = workflows.filter(w => 
        w.name.toLowerCase().includes(search.toLowerCase()) || 
        (w.description && w.description.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-100 p-8">
            <header className="flex items-center justify-between mb-8 pb-6 border-b border-neutral-800">
                <div className="flex items-center space-x-4">
                    <div className="p-3 bg-purple-600 rounded-xl shadow-lg shadow-purple-900/40">
                        <WorkflowIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Workflow Orchestration</h1>
                        <p className="text-neutral-500 text-sm">Design, Schedule, and Run Automation Flows</p>
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                     <Link href="/" className="px-4 py-2 text-sm font-medium text-neutral-400 hover:text-white transition-colors">
                        Back to Dashboard
                    </Link>
                    <button 
                        onClick={createWorkflow} 
                        className="flex items-center space-x-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold text-sm shadow-xl shadow-purple-900/20 hover:scale-105 transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Create Workflow</span>
                    </button>
                </div>
            </header>
            
            <div className="flex items-center space-x-4 mb-8 bg-neutral-900/50 p-2 rounded-2xl border border-neutral-800 w-full max-w-md">
                <Search className="w-5 h-5 text-neutral-500 ml-2" />
                <input 
                    type="text" 
                    placeholder="Search workflows..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-transparent flex-1 outline-none text-sm text-neutral-200 placeholder-neutral-600"
                />
            </div>

            {loading ? (
                 <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-purple-500" /></div>
            ) : filteredWorkflows.length === 0 ? (
                <div className="text-center py-20 space-y-4">
                    <div className="inline-block p-6 bg-neutral-900 rounded-full mb-4">
                         <WorkflowIcon className="w-12 h-12 text-neutral-700" />
                    </div>
                    <h3 className="text-lg font-medium text-neutral-400">No workflows found</h3>
                    <p className="text-neutral-500 text-sm">Get started by creating your first automation workflow.</p>
                    <button onClick={createWorkflow} className="text-purple-400 hover:underline text-sm font-bold">Create Workflow</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredWorkflows.map(workflow => (
                        <div 
                            key={workflow.id} 
                            onClick={() => router.push(`/workflows/builder/${workflow.id}`)}
                            className="group bg-neutral-900/50 border border-neutral-800 hover:border-purple-500/50 rounded-2xl p-6 cursor-pointer transition-all hover:bg-neutral-900 hover:shadow-2xl hover:shadow-purple-900/10 flex flex-col justify-between min-h-[180px]"
                        >
                            <div>
                                <div className="flex items-start justify-between mb-4">
                                    <h3 className="text-lg font-bold text-neutral-200 group-hover:text-white transition-colors line-clamp-1" title={workflow.name}>{workflow.name}</h3>
                                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={(e) => { e.stopPropagation(); router.push(`/workflows/${workflow.id}/runs`); }} className="p-2 text-neutral-500 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors" title="View History"><Clock className="w-4 h-4" /></button>
                                        <button onClick={(e) => deleteWorkflow(workflow.id, e)} className="p-2 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                                <p className="text-sm text-neutral-500 line-clamp-2 h-10">{workflow.description || 'No description provided.'}</p>
                            </div>
                            
                            <div className="flex items-center justify-between pt-4 border-t border-neutral-800 mt-4">
                                <span className="text-xs text-neutral-600 font-mono">v{workflow.version}</span>
                                <span className="text-xs text-neutral-600">Updated {new Date(workflow.updated_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
