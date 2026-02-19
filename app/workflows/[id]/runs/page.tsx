
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Clock, CheckCircle, XCircle, AlertTriangle, Play } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function WorkflowRunsPage() {
    const { id } = useParams();
    const router = useRouter();
    const [runs, setRuns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) fetchRuns();
    }, [id]);

    const fetchRuns = async () => {
        const res = await fetch(`/api/workflows/${id}/runs`);
        const data = await res.json();
        if (data.success) {
            setRuns(data.runs);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-100 p-8">
            <header className="flex items-center gap-4 mb-8 pb-6 border-b border-neutral-800">
                <button onClick={() => router.push('/workflows')} className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold">Run History</h1>
                    <p className="text-neutral-500 text-sm">View execution logs for Workflow #{id}</p>
                </div>
            </header>

            {loading ? (
                <div className="text-center py-20 text-neutral-500">Loading runs...</div>
            ) : runs.length === 0 ? (
                <div className="text-center py-20 text-neutral-500">
                    <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">No runs found for this workflow.</p>
                    <p className="text-sm max-w-md mx-auto">
                        Execute this workflow from the <b>Builder</b> page to see execution logs and results here.
                    </p>
                    <button 
                        onClick={() => router.push(`/workflows/builder/${id}`)}
                        className="mt-6 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-white text-sm font-medium transition-colors inline-flex items-center gap-2"
                    >
                        <Play size={16} />
                        Go to Builder
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {runs.map(run => (
                        <div 
                            key={run.id}
                            onClick={() => router.push(`/workflows/runs/${run.id}`)}
                            className="bg-neutral-900 border border-neutral-800 hover:border-neutral-700 p-4 rounded-xl cursor-pointer transition-all hover:bg-neutral-800 flex items-center justify-between group"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-2 rounded-lg 
                                    ${run.status === 'completed' ? 'bg-green-500/20 text-green-500' : 
                                      run.status === 'failed' ? 'bg-red-500/20 text-red-500' : 
                                      'bg-yellow-500/20 text-yellow-500'}`}>
                                    {run.status === 'completed' ? <CheckCircle size={20} /> : 
                                     run.status === 'failed' ? <XCircle size={20} /> : 
                                     <Play size={20} className="animate-pulse" />}
                                </div>
                                <div>
                                    <div className="font-bold text-sm mb-1 uppercase tracking-wider text-neutral-400">Run ID: {run.id}</div> 
                                    <div className="text-xs text-neutral-500">
                                        {formatDistanceToNow(new Date(run.created_at), { addSuffix: true })}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <div className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Duration</div>
                                    <div className="font-mono text-sm">{run.duration_ms ? `${(run.duration_ms / 1000).toFixed(2)}s` : '-'}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Status</div>
                                    <div className={`font-bold text-sm capitalize ${
                                        run.status === 'completed' ? 'text-green-400' : 
                                        run.status === 'failed' ? 'text-red-400' : 
                                        'text-yellow-400'
                                    }`}>
                                        {run.status}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
