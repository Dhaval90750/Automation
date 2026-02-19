'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Editor from '@monaco-editor/react';
import { 
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    BarChart, Bar, AreaChart, Area 
} from 'recharts';
import { Loader2, Terminal, FileCode, Save, Plus, FolderOpen, LayoutTemplate, Trash2, Clock, Rocket, Monitor, Layout, History, CheckCircle2, XCircle, Wand2, Calendar, Code2, Sparkles, Database } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Helper Components

const AnalyticsDashboard = ({ stats, history }: { stats: any, history: any[] }) => {
    const timelineData = history?.length > 0 ? history.map(run => ({
        timestamp: run.created_at || run.timestamp,
        duration: (run.duration_ms || run.duration) / 1000,
        status: run.status === 'passed' || run.results?.every((r:any) => r.success) ? 1 : 0
    })) : [];
    const trendData = history?.length > 0 ? history.slice(-7).map(run => ({
        name: new Date(run.timestamp || run.created_at).toLocaleDateString(),
        success: run.results?.filter((r: any) => r.success).length || (run.status === 'passed' ? 1 : 0),
        failed: run.results?.filter((r: any) => !r.success).length || (run.status === 'failed' ? 1 : 0),
        time: (run.duration || run.duration_ms) / 1000
    })) : [];
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: 'AVG SUCCESS RATE', value: '94%', icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                    { label: 'TOTAL RUNS (24H)', value: stats?.total || '128', icon: Rocket, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                    { label: 'AVG DURATION', value: stats?.avg_duration ? `${(stats.avg_duration/1000).toFixed(1)}s` : '14.2s', icon: Clock, color: 'text-purple-400', bg: 'bg-purple-500/10' },
                    { label: 'FLAKY TESTS', value: '3', icon: Wand2, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
                ].map((stat, i) => (
                    <div key={i} className="bg-[#111111] border border-neutral-800/50 p-6 rounded-[2rem] shadow-2xl hover:border-neutral-700 transition-all flex flex-col justify-between h-40">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[11px] font-bold text-neutral-500 tracking-widest">{stat.label}</span>
                            <div className={cn("p-2 rounded-xl", stat.bg)}><stat.icon className={cn("w-4 h-4", stat.color)} /></div>
                        </div>
                        <div className="text-4xl font-bold text-white tracking-tight">{stat.value}</div>
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
                <div className="bg-[#111111] border border-neutral-800/50 p-8 rounded-[2rem] shadow-2xl">
                    <h4 className="text-sm font-bold text-neutral-200 flex items-center space-x-3 mb-10">
                        <History className="w-5 h-5 text-emerald-500" />
                        <span>Execution Success Trends</span>
                    </h4>
                    <div className="h-[280px]"><ResponsiveContainer width="100%" height="100%"><AreaChart data={trendData}><defs><linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} /><XAxis dataKey="name" stroke="#525252" fontSize={10} axisLine={false} tickLine={false} /><YAxis stroke="#525252" fontSize={10} axisLine={false} tickLine={false} /><Tooltip contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626', borderRadius: '12px' }} itemStyle={{ fontSize: '10px' }}/><Area type="monotone" dataKey="success" stroke="#10b981" fillOpacity={1} fill="url(#colorSuccess)" strokeWidth={2} /><Area type="monotone" dataKey="failed" stroke="#ef4444" fill="transparent" strokeWidth={2} /></AreaChart></ResponsiveContainer></div>
                </div>
                <div className="bg-[#111111] border border-neutral-800/50 p-8 rounded-[2rem] shadow-2xl">
                    <h4 className="text-sm font-bold text-neutral-200 flex items-center space-x-3 mb-10">
                        <Clock className="w-5 h-5 text-blue-500" />
                        <span>Run Duration (Seconds)</span>
                    </h4>
                    <div className="h-[280px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={trendData}><CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} /><XAxis dataKey="name" stroke="#525252" fontSize={10} axisLine={false} tickLine={false} /><YAxis stroke="#525252" fontSize={10} axisLine={false} tickLine={false} /><Tooltip cursor={{fill: '#262626'}} contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626', borderRadius: '12px' }}/><Bar dataKey="time" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={20} /></BarChart></ResponsiveContainer></div>
                </div>
            </div>
            <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl shadow-xl">
                <h4 className="text-sm font-bold text-neutral-300 flex items-center space-x-2 mb-6"><Calendar className="w-4 h-4 text-purple-500" /><span>Performance Heatmap</span></h4>
                <div className="grid grid-cols-12 gap-1 h-8">{timelineData.slice(-48).map((run, i) => (<div key={i} className={cn("h-full rounded-sm transition-all", run.status ? "bg-emerald-500/50 hover:bg-emerald-400" : "bg-red-500/50 hover:bg-red-400")} title={`${new Date(run.timestamp).toLocaleString()}\nDuration: ${run.duration}s`}/>))}</div>
            </div>
        </div>
    );
};

const NoCodeStepBuilder = ({ steps, onStepsChange }: { steps: any[], onStepsChange: (steps: any[]) => void }) => {
    const addStep = () => onStepsChange([...steps, { id: Date.now().toString(), action: 'click', value: '', selector: '' }]);
    const updateStep = (id: string, field: string, val: any) => onStepsChange(steps.map(s => s.id === id ? { ...s, [field]: val } : s));
    const removeStep = (id: string) => onStepsChange(steps.filter(s => s.id !== id));
    return (
        <div className="space-y-3 p-4 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-xl mb-4">
            <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Logic Builder</h4>
                <button onClick={addStep} className="p-1 hover:bg-neutral-800 rounded text-emerald-500"><Plus className="w-3.5 h-3.5" /></button>
            </div>
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-neutral-800">
                {steps.map((step, idx) => (
                    <div key={step.id || `step-${idx}`} className="group relative flex items-center space-x-3 bg-neutral-950/50 p-3 rounded-xl border border-neutral-800 hover:border-neutral-700 transition-all">
                        <span className="text-[10px] font-bold text-neutral-700 w-4">{idx + 1}</span>
                        <select value={step.action} onChange={(e) => updateStep(step.id, 'action', e.target.value)} className="bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-[10px] text-blue-400 outline-none">
                            <option value="goto">Navigate</option><option value="click">Click</option><option value="type">Type</option><option value="assertion">Verify</option><option value="waitFor">Wait For</option>
                        </select>
                        <input type="text" placeholder="Value / Selector" value={step.value || step.selector} onChange={(e) => updateStep(step.id, step.action === 'goto' || step.action === 'assertion' ? 'value' : 'selector', e.target.value)} className="flex-1 bg-transparent border-b border-neutral-800 focus:border-emerald-500 text-[11px] text-neutral-300 outline-none py-1" />
                        <button onClick={() => removeStep(step.id)} className="opacity-0 group-hover:opacity-100 p-1 text-neutral-600 hover:text-red-400 transition-all"><Trash2 className="w-3 h-3"/></button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const TerminalWindow = ({ logs, onClear }: { logs: string[], onClear: () => void }) => {
    const formatLog = (log: string) => {
        if (log.toLowerCase().includes('failed') || log.toLowerCase().includes('error')) return <span className="text-red-400 font-bold">{log}</span>;
        if (log.toLowerCase().includes('passed') || log.toLowerCase().includes('successfully')) return <span className="text-emerald-400 font-bold">{log}</span>;
        if (log.toLowerCase().includes('executing')) return <span className="text-blue-400">{log}</span>;
        return <span className="text-neutral-400">{log}</span>;
    };
    return (
        <div className="mt-6 border border-neutral-800 rounded-xl overflow-hidden bg-black shadow-2xl relative">
            <div className="bg-neutral-900/80 px-4 py-2 border-b border-neutral-800 flex items-center justify-between">
                <div className="flex items-center space-x-2"><Terminal className="w-4 h-4 text-emerald-500" /><span className="text-[10px] uppercase font-bold text-neutral-400 tracking-widest">Terminal Output</span></div>
                <button onClick={onClear} className="text-neutral-500 hover:text-neutral-300 text-[9px] uppercase">Clear</button>
            </div>
            <div className="h-[300px] overflow-y-auto p-4 font-mono text-[11px] leading-relaxed">
                <div className="space-y-1">{logs.map((log, i) => (<div key={i} className="flex space-x-2 group"><span className="text-neutral-600 select-none min-w-[20px]">{i + 1}</span><div className="break-all">{formatLog(log)}</div></div>))}</div>
            </div>
        </div>
    );
};

const ExecutionHistory = ({ runs, onOpenScript }: { runs: any[], onOpenScript: (path: string) => void }) => {
    const [selectedRun, setSelectedRun] = useState<any>(null);
    return (
        <div className="grid grid-cols-12 gap-6 h-full">
            <div className="col-span-5 bg-[#111111] border border-neutral-800/50 rounded-3xl overflow-hidden flex flex-col shadow-2xl">
                <div className="p-4 border-b border-neutral-800 bg-black/20 flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-neutral-500 tracking-[0.2em]">Execution Logs</span>
                    <History className="w-4 h-4 text-neutral-700" />
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {runs.map(run => (
                        <button key={run.id} onClick={() => setSelectedRun(run)} className={cn("w-full text-left p-4 rounded-2xl border transition-all flex flex-col space-y-2", selectedRun?.id === run.id ? "bg-white/5 border-neutral-700" : "bg-neutral-900/30 border-transparent hover:border-neutral-800")}>
                            <div className="flex items-center justify-between">
                                <span className={cn("text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-tighter", run.status === 'passed' ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500")}>{run.status}</span>
                                <span className="text-[10px] text-neutral-600 font-mono italic">{new Date(run.created_at).toLocaleString()}</span>
                            </div>
                            <div className="text-xs font-bold text-neutral-300 truncate">{run.flow_name || 'Ad-Hoc Script'}</div>
                            <div className="text-[10px] text-neutral-500 flex items-center space-x-2"><Clock className="w-3 h-3" /><span>{(run.duration_ms / 1000).toFixed(2)}s</span></div>
                        </button>
                    ))}
                </div>
            </div>
            <div className="col-span-7 space-y-6 overflow-y-auto pr-2 scrollbar-none">
                {selectedRun ? (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500 pb-10">
                        <div className="bg-[#111111] border border-neutral-800/50 p-6 rounded-3xl shadow-2xl">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-xs font-black uppercase text-neutral-500 tracking-widest">Run Details</h4>
                                {selectedRun.test_path && (
                                    <button onClick={() => onOpenScript(selectedRun.test_path)} className="text-[10px] font-bold text-purple-400 hover:text-purple-300 flex items-center space-x-1.5 transition-colors">
                                        <Code2 className="w-3.5 h-3.5" />
                                        <span>OPEN SCRIPT IN EDITOR</span>
                                    </button>
                                )}
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="p-4 bg-neutral-900/50 rounded-2xl border border-neutral-800">
                                    <div className="text-[9px] text-neutral-600 mb-1">STATUS</div>
                                    <div className={cn("text-lg font-black", selectedRun.status === 'passed' ? "text-emerald-500" : "text-red-500")}>{selectedRun.status.toUpperCase()}</div>
                                </div>
                                <div className="p-4 bg-neutral-900/50 rounded-2xl border border-neutral-800">
                                    <div className="text-[9px] text-neutral-600 mb-1">DURATION</div>
                                    <div className="text-lg font-black text-blue-400">{(selectedRun.duration_ms / 1000).toFixed(2)}s</div>
                                </div>
                                <div className="p-4 bg-neutral-900/50 rounded-2xl border border-neutral-800">
                                    <div className="text-[9px] text-neutral-600 mb-1">TIMESTAMP</div>
                                    <div className="text-[11px] font-bold text-neutral-400">{new Date(selectedRun.created_at).toLocaleTimeString()}</div>
                                </div>
                            </div>
                        </div>

                        {selectedRun.screenshot && (
                            <div className="bg-[#111111] border border-neutral-800/50 p-6 rounded-3xl shadow-2xl">
                                <h4 className="text-xs font-black uppercase text-neutral-500 tracking-widest mb-4">Final State Screenshot</h4>
                                <div className="rounded-2xl overflow-hidden border border-neutral-800 bg-black">
                                    <img src={selectedRun.screenshot} className="w-full h-auto cursor-zoom-in hover:scale-[1.02] transition-transform" alt="Test Screenshot" onClick={() => window.open(selectedRun.screenshot, '_blank')} />
                                </div>
                            </div>
                        )}

                        <div className="bg-black border border-neutral-800 rounded-3xl p-6 shadow-2xl">
                             <h4 className="text-xs font-black uppercase text-neutral-500 tracking-widest mb-4">Detailed Logs</h4>
                             <pre className="text-[11px] font-mono text-neutral-400 overflow-x-auto whitespace-pre-wrap leading-relaxed">{selectedRun.logs}</pre>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-neutral-700 space-y-4 italic opacity-50">
                        <div className="p-8 bg-neutral-900/50 rounded-full border border-neutral-800"><History className="w-16 h-16" /></div>
                        <p className="text-sm">Select a test run from the history to view detailed reports and screenshots</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// ... imports
import { Modal, InputModal, ConfirmModal } from '@/app/components/ui/Modal';

// ... (previous helper components)

export default function ManagementPage() {
    const [activeTab, setActiveTab] = useState<'tests' | 'pom' | 'analytics' | 'history' | 'cicd' | 'bdd' | 'suites' | 'data'>('tests');
    const [files, setFiles] = useState<any[]>([]);
    const [selectedFile, setSelectedFile] = useState<string | null>(null);
    const [fileContent, setFileContent] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
    const [pages, setPages] = useState<any[]>([]);
    const [selectedPage, setSelectedPage] = useState<any>(null);
    const [selectors, setSelectors] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [runHistory, setRunHistory] = useState<any[]>([]);
    const [_jobs, setJobs] = useState<any[]>([]);
    const [_suites, setSuites] = useState<{ [tag: string]: any[] }>({});
    const [_snapshots, setSnapshots] = useState<string[]>([]);
    const [dataFiles, setDataFiles] = useState<string[]>([]);
    const [selectedDataFile, setSelectedDataFile] = useState<string | null>(null);
    const [dataContent, setDataContent] = useState('');

    // Modal States
    const [modalState, setModalState] = useState<{
        type: 'input' | 'confirm' | null;
        action: string | null;
        title: string;
        label?: string;
        message?: string;
        defaultValue?: string;
        placeholder?: string;
        submitText?: string;
        confirmText?: string;
        intent?: 'danger' | 'primary';
        payload?: any;
    }>({ type: null, action: null, title: '' });

    useEffect(() => {
        fetchFiles(); fetchPages(); fetchJobs(); fetchSuites(); fetchReports(); fetchDataFiles();
    }, []);

    // ... (fetch functions remain same) ...
     const fetchFiles = async () => { const res = await fetch('/api/files'); const json = await res.json(); if (json.success) setFiles(json.files); };
    const fetchPages = async () => { const res = await fetch('/api/pom?type=pages'); const json = await res.json(); if (json.success) setPages(json.data); };
    const fetchSelectors = async (pageId: number) => { const res = await fetch(`/api/pom?type=selectors&pageId=${pageId}`); const json = await res.json(); if (json.success) setSelectors(json.data); };
    const fetchJobs = async () => { const res = await fetch('/api/jobs'); const json = await res.json(); if (json.success) setJobs(json.jobs); };
    const fetchSuites = async () => { const res = await fetch('/api/suites'); const json = await res.json(); if (json.success) setSuites(json.suites); };
    const fetchReports = async () => { const res = await fetch('/api/reports'); const json = await res.json(); if (json.success) { setStats(json.stats); setRunHistory(json.runs); } };
    const fetchSnapshots = async () => { const res = await fetch('/api/visual'); const json = await res.json(); if (json.success) setSnapshots(json.snapshots); };
    const fetchDataFiles = async () => { 
        const res = await fetch('/api/data'); 
        const json = await res.json(); 
        if (json.success) setDataFiles(json.files); 
    };

    const loadDataFile = async (name: string) => {
        setSelectedDataFile(name);
        const res = await fetch(`/api/data?path=${name}`);
        const json = await res.json();
        if (json.success) {
            setDataContent(JSON.stringify(json.data, null, 2));
        }
    };

    const saveDataFile = async () => {
        if (!selectedDataFile) return;
        const res = await fetch('/api/data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: selectedDataFile, content: dataContent })
        });
        if ((await res.json()).success) {
            setTerminalLogs(prev => [...prev, `Saved Data: ${selectedDataFile}`]);
            fetchDataFiles();
        }
    };

    // --- Modal Actions ---

    const handleInputSubmit = async (value: string) => {
        const { action, payload } = modalState;
        
        if (action === 'createDataFile') {
            const res = await fetch('/api/data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: value, content: value.endsWith('.json') ? '[]' : 'col1,col2' })
            });
            if ((await res.json()).success) fetchDataFiles();
        }
        else if (action === 'createFile') {
            const res = await fetch('/api/files', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path: value, content: value.endsWith('.json') ? '[]' : '# New Test Script' })
            });
            if ((await res.json()).success) fetchFiles();
        }
        else if (action === 'createPage') {
            // This needs two steps (name + url), but let's simplify for now or use specific modal.
            // Actually, let's keep it simple: Name first, then specific modal for URL or just default URL. 
            // OR we can make a custom modal for Create Page. 
            // Implementing a simpler flow: Just create generic page object, user edits details later if we had UI.
            // But we need URL. Let's trigger a second modal or just ask for Name and set empty desc.
            // Wait, we can't easily chain modals with this simple state. 
            // Let's assume user enters "Name" and we add placeholders.
            const res = await fetch('/api/pom', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'page', name: value, url: 'https://example.com', description: '' })
            });
            if ((await res.json()).success) fetchPages();
        }
         else if (action === 'addSelector') {
            // Similarly, needs Name and Selector. 
            // Let's use a delimited string or just ask for Name and default selector?
            // "Login Button | #login"
            const [name, selector] = value.includes('|') ? value.split('|').map(s => s.trim()) : [value, ''];
            if (!name) return;
            
            const res = await fetch('/api/pom', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'selector', pageId: payload.id, name, selector: selector || '.selector', elementType: 'button' })
            });
            if ((await res.json()).success) fetchSelectors(payload.id);
        }
    };

    const handleConfirm = async () => {
        const { action, payload } = modalState;

        if (action === 'deleteDataFile') {
            const res = await fetch(`/api/data?name=${payload}`, { method: 'DELETE' });
            if ((await res.json()).success) {
                if (selectedDataFile === payload) { setSelectedDataFile(null); setDataContent(''); }
                fetchDataFiles();
            }
        }
        else if (action === 'deleteFile') {
             const res = await fetch(`/api/files?path=${payload}`, { method: 'DELETE' });
            if ((await res.json()).success) {
                if (selectedFile === payload) { setSelectedFile(null); setFileContent(''); }
                fetchFiles();
            }
        }
        else if (action === 'deletePage') {
            const res = await fetch(`/api/pom?type=page&id=${payload.id}`, { method: 'DELETE' });
            if ((await res.json()).success) {
                if (selectedPage?.id === payload.id) setSelectedPage(null);
                fetchPages();
            }
        }
    };

    // --- Action Triggers ---

    const openCreateDataFile = () => setModalState({ 
        type: 'input', action: 'createDataFile', title: 'Create Data Source', label: 'File Name', placeholder: 'users.json' 
    });
    const openDeleteDataFile = (name: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setModalState({ 
            type: 'confirm', action: 'deleteDataFile', title: 'Delete Data Source', message: `Are you sure you want to delete ${name}? This action cannot be undone.`, payload: name, intent: 'danger', confirmText: 'Delete' 
        });
    };

    const loadFile = async (path: string) => { 
        setSelectedFile(path); 
        const res = await fetch(`/api/files/read?path=${path}`); 
        const json = await res.json(); 
        if (json.success) setFileContent(typeof json.content === 'string' ? json.content : (json.content.raw || JSON.stringify(json.content, null, 2))); 
    };

    const saveFile = async () => {
        if (!selectedFile) return;
        try {
            const res = await fetch('/api/files', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path: selectedFile, content: fileContent })
            });
            const json = await res.json();
            if (json.success) setTerminalLogs(prev => [...prev, `Saved: ${selectedFile}`]);
        } catch (e) {
            console.error(e);
        }
    };

    const openCreateFile = () => setModalState({
        type: 'input', action: 'createFile', title: 'Create Test Script', label: 'Script Name', placeholder: 'login.spec.ts', submitText: 'Create Script'
    });

    const openDeleteFile = (path: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setModalState({
            type: 'confirm', action: 'deleteFile', title: 'Delete Script', message: `Permanently delete ${path}?`, payload: path, intent: 'danger', confirmText: 'Delete'
        });
    };

    const openCreatePage = () => setModalState({
        type: 'input', action: 'createPage', title: 'Create Page Object', label: 'Page Name', placeholder: 'Dashboard Page'
    });

    const openDeletePage = (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setModalState({
            type: 'confirm', action: 'deletePage', title: 'Delete Page Object', message: 'Delete this page and all associated selectors?', payload: { id }, intent: 'danger', confirmText: 'Delete Page'
        });
    };

    useEffect(() => {
        if (selectedPage) fetchSelectors(selectedPage.id);
    }, [selectedPage]);

    const openAddSelector = () => {
        if (!selectedPage) return;
        setModalState({
             type: 'input', action: 'addSelector', title: 'Add Selector', label: 'Name | Selector', placeholder: 'Submit Button | #submit-btn', payload: { id: selectedPage.id }, submitText: 'Add Selector'
        });
    };

    const deleteSelector = async (id: number) => {
        const res = await fetch(`/api/pom?type=selector&id=${id}`, { method: 'DELETE' });
        if ((await res.json()).success) fetchSelectors(selectedPage.id);
    };

    const runTest = async () => {
        if (!selectedFile) return;
        setIsRunning(true); setTerminalLogs(["Initializing execution..."]);
        try {
            const res = await fetch('/api/tests/exec', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ path: selectedFile }) });
            const json = await res.json();
            setTerminalLogs(prev => [...prev, ...(json.logs || [json.error || 'Execution Error'])]);
            fetchReports(); // Refresh history
        } finally { setIsRunning(false); }
    };

    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-100 p-6 flex flex-col space-y-6">
            <InputModal 
                isOpen={modalState.type === 'input'}
                onClose={() => setModalState({ ...modalState, type: null })}
                onSubmit={handleInputSubmit}
                title={modalState.title}
                label={modalState.label || ''}
                placeholder={modalState.placeholder}
                submitText={modalState.submitText}
            />
            <ConfirmModal 
                isOpen={modalState.type === 'confirm'}
                onClose={() => setModalState({ ...modalState, type: null })}
                onConfirm={handleConfirm}
                title={modalState.title}
                message={modalState.message || ''}
                intent={modalState.intent}
                confirmText={modalState.confirmText}
            />
            <div className="flex bg-neutral-900/50 border border-neutral-100/5 backdrop-blur-md rounded-2xl p-1.5 w-fit self-center shadow-2xl">
                {[
                    { id: 'tests', label: 'Test Scripts', icon: FileCode },
                    { id: 'pom', label: 'Page Objects', icon: LayoutTemplate },
                    { id: 'analytics', label: 'Analytics', icon: History },
                    { id: 'history', label: 'History', icon: Clock },
                    { id: 'ci', label: 'CI/CD', icon: Rocket },
                    { id: 'bdd', label: 'BDD', icon: Code2 },
                    { id: 'suites', label: 'Suites', icon: Database },
                    { id: 'data', label: 'Data Sources', icon: FileCode }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => {
                            setActiveTab(tab.id as any);
                            if (tab.id === 'tests') fetchFiles();
                            if (tab.id === 'pom') fetchPages();
                            if (tab.id === 'data') fetchDataFiles();
                        }}
                        className={cn(
                            "flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all relative",
                            activeTab === tab.id ? "text-white shadow-lg" : "text-neutral-500 hover:text-neutral-300 hover:bg-white/5"
                        )}
                    >
                        {activeTab === tab.id && <div className="absolute inset-0 bg-neutral-800 rounded-xl -z-10 animate-in zoom-in-95 duration-200" />}
                        <tab.icon className={cn("w-3.5 h-3.5", activeTab === tab.id ? "text-white" : "text-neutral-500")} />
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            <main className="grid grid-cols-12 gap-8 flex-1">
                <aside className="col-span-3 bg-neutral-900/80 backdrop-blur-sm border border-neutral-800 rounded-3xl overflow-hidden flex flex-col h-[750px] shadow-2xl">
                    <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
                        <span className="font-black text-[10px] uppercase text-neutral-600 tracking-[0.2em]">Management Explorer</span>
                        <div className="flex items-center space-x-2">
                             {activeTab === 'tests' && <button onClick={openCreateFile} className="p-1 hover:bg-neutral-800 rounded text-purple-400" title="New Script"><Plus className="w-4 h-4" /></button>}
                             {activeTab === 'pom' && <button onClick={openCreatePage} className="p-1 hover:bg-neutral-800 rounded text-emerald-400" title="New Page"><Plus className="w-4 h-4" /></button>}
                             {activeTab === 'data' && <button onClick={openCreateDataFile} className="p-1 hover:bg-neutral-800 rounded text-blue-400" title="New Data Source"><Plus className="w-4 h-4" /></button>}
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-1">
                        {activeTab === 'tests' && (
                            <>
                                {files.map(file => (
                                    <div key={file.path} className="group relative">
                                        <button onClick={() => loadFile(file.path)} className={cn("w-full text-left px-4 py-3 rounded-2xl text-sm flex items-center space-x-3 transition-all duration-200 group-hover:pr-10", selectedFile === file.path ? "bg-purple-600 text-white shadow-lg shadow-purple-900/40" : "hover:bg-neutral-800/50 text-neutral-400")}>
                                            <FileCode className={cn("w-4 h-4", selectedFile === file.path ? "text-white" : "text-purple-500")} /><span className="truncate font-medium">{file.name}</span>
                                        </button>
                                        <button onClick={(e) => openDeleteFile(file.path, e)} className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/10 text-neutral-600 hover:text-red-400 rounded-lg transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                                    </div>
                                ))}
                                {files.length === 0 && <div className="p-4 text-center text-neutral-600 text-xs italic">No scripts found. Create one to get started.</div>}
                            </>
                        )}
                        {activeTab === 'data' && dataFiles.map(file => (
                            <div key={file} className="group relative">
                                <button onClick={() => loadDataFile(file)} className={cn("w-full text-left px-4 py-3 rounded-2xl text-sm flex items-center space-x-3 transition-all duration-200 group-hover:pr-10", selectedDataFile === file ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40" : "hover:bg-neutral-800/50 text-neutral-400")}>
                                    <Database className={cn("w-4 h-4", selectedDataFile === file ? "text-white" : "text-blue-500")} /><span className="truncate font-medium">{file}</span>
                                </button>
                                <button onClick={(e) => openDeleteDataFile(file, e)} className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/10 text-neutral-600 hover:text-red-400 rounded-lg transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                        ))}
                        {activeTab === 'pom' && pages.map(page => (
                            <div key={page.id} className="group relative">
                                <button onClick={() => setSelectedPage(page)} className={cn("w-full text-left px-4 py-3 rounded-2xl text-sm flex items-center space-x-3 transition-all duration-200 group-hover:pr-10", selectedPage?.id === page.id ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/40" : "hover:bg-neutral-800/50 text-neutral-400")}>
                                    <LayoutTemplate className={cn("w-4 h-4", selectedPage?.id === page.id ? "text-white" : "text-emerald-500")} /><span className="truncate font-medium">{page.name}</span>
                                </button>
                                <button onClick={(e) => openDeletePage(page.id, e)} className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/10 text-neutral-600 hover:text-red-400 rounded-lg transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                        ))}
                    </div>
                </aside>

                <section className="col-span-9 space-y-8 h-[750px] overflow-y-auto pr-2 scrollbar-none">
                    {activeTab === 'tests' && selectedFile ? (
                        <div className="flex flex-col space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                            {selectedFile.endsWith('.json') && (() => {
                                try {
                                    const steps = JSON.parse(fileContent || '[]');
                                    return (
                                        <div className="space-y-4">
                                            {/* AI Prompt Interface - Top Left */}
                                            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 shadow-xl">
                                                <div className="flex items-center space-x-2 mb-3">
                                                    <Sparkles className="w-4 h-4 text-purple-400" />
                                                    <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">AI Agent</h4>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <input 
                                                        type="text" 
                                                        placeholder="Describe a test case (e.g. 'Login to google.com and search for AI')..." 
                                                        className="flex-1 bg-black/50 border border-neutral-800 rounded-xl px-4 py-2 text-sm text-neutral-200 outline-none focus:border-purple-500 transition-colors"
                                                        onKeyDown={async (e) => {
                                                            if (e.key === 'Enter') {
                                                                const target = e.target as HTMLInputElement;
                                                                const prompt = target.value;
                                                                if (!prompt) return;
                                                                target.value = 'Generating steps...';
                                                                target.disabled = true;
                                                                try {
                                                                    const res = await fetch('/api/ai', {
                                                                        method: 'POST',
                                                                        headers: { 'Content-Type': 'application/json' },
                                                                        body: JSON.stringify({ prompt })
                                                                    });
                                                                    const data = await res.json();
                                                                    if (data.success) {
                                                                        setFileContent(JSON.stringify(data.steps, null, 2));
                                                                        target.value = '';
                                                                    } else {
                                                                        alert('AI Error: ' + data.error);
                                                                        target.value = prompt;
                                                                    }
                                                                } catch (err) {
                                                                    console.error(err);
                                                                    target.value = prompt;
                                                                } finally {
                                                                    target.disabled = false;
                                                                }
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <NoCodeStepBuilder steps={steps} onStepsChange={(newSteps) => setFileContent(JSON.stringify(newSteps, null, 2))} />
                                        </div>
                                    );
                                } catch (_e) {
                                    return (
                                        <div className="p-4 bg-red-900/20 border border-red-900/50 rounded-2xl text-red-400 text-xs flex items-center space-x-2">
                                            <XCircle className="w-4 h-4" />
                                            <span>Invalid JSON format in file. No-Code Builder disabled.</span>
                                        </div>
                                    );
                                }
                            })()}
                            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
                                <div className="px-6 py-4 border-b border-neutral-800 flex justify-between items-center bg-black/20">
                                    <div className="flex items-center space-x-3"><div className="p-2 bg-purple-500/10 rounded-lg"><FileCode className="w-4 h-4 text-purple-400" /></div><span className="font-mono text-xs text-neutral-300">{selectedFile}</span></div>
                                    <div className="flex items-center space-x-4">
                                        <button onClick={saveFile} className="p-2 hover:bg-white/5 rounded-lg text-neutral-400 hover:text-white transition-all" title="Save File"><Save className="w-4 h-4" /></button>
                                        <button onClick={runTest} disabled={isRunning} className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-6 py-2 rounded-xl text-xs font-black transition-all shadow-xl shadow-purple-900/20 active:scale-95 flex items-center space-x-2">
                                            {isRunning ? <Loader2 className="w-4 h-4 animate-spin"/> : <Rocket className="w-4 h-4" />}<span>LAUNCH EXECUTION</span>
                                        </button>
                                    </div>
                                </div>
                                <div className="h-[450px]"><Editor height="100%" theme="vs-dark" language={selectedFile.endsWith('.py') ? 'python' : 'javascript'} value={fileContent} onChange={v => setFileContent(v || '')} options={{ minimap: { enabled: false }, fontSize: 13, padding: { top: 20 } }} /></div>
                            </div>
                            <TerminalWindow logs={terminalLogs} onClear={() => setTerminalLogs([])} />
                        </div>
                    ) : activeTab === 'data' && selectedDataFile ? (
                        <div className="flex flex-col space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                             <div className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
                                <div className="px-6 py-4 border-b border-neutral-800 flex justify-between items-center bg-black/20">
                                    <div className="flex items-center space-x-3"><div className="p-2 bg-blue-500/10 rounded-lg"><Database className="w-4 h-4 text-blue-400" /></div><span className="font-mono text-xs text-neutral-300">{selectedDataFile}</span></div>
                                    <div className="flex items-center space-x-4">
                                        <button onClick={saveDataFile} className="p-2 hover:bg-white/5 rounded-lg text-neutral-400 hover:text-white transition-all" title="Save Data"><Save className="w-4 h-4" /></button>
                                    </div>
                                </div>
                                <div className="h-[600px]"><Editor height="100%" theme="vs-dark" language="json" value={dataContent} onChange={v => setDataContent(v || '')} options={{ minimap: { enabled: false }, fontSize: 13, padding: { top: 20 } }} /></div>
                            </div>
                        </div>
                    ) : activeTab === 'pom' && selectedPage ? (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                             <div className="bg-[#111111] border border-neutral-800/50 p-8 rounded-[2rem] shadow-2xl">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center space-x-4">
                                        <div className="p-3 bg-emerald-500/10 rounded-2xl"><LayoutTemplate className="w-6 h-6 text-emerald-500" /></div>
                                        <div>
                                            <h2 className="text-xl font-bold text-white">{selectedPage.name}</h2>
                                            <p className="text-xs text-neutral-500 font-mono italic">{selectedPage.url || 'No Base URL'}</p>
                                        </div>
                                    </div>
                                    <button onClick={openAddSelector} className="flex items-center space-x-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition-all shadow-lg shadow-emerald-900/20"><Plus className="w-4 h-4" /><span>ADD SELECTOR</span></button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {selectors.map(sel => (
                                        <div key={sel.id} className="group p-5 bg-neutral-900/50 border border-neutral-800 rounded-2xl hover:border-emerald-500/30 transition-all flex items-center justify-between">
                                            <div className="space-y-1">
                                                <div className="text-[11px] font-black uppercase text-neutral-500 tracking-widest">{sel.name}</div>
                                                <div className="text-xs font-mono text-emerald-400 bg-emerald-400/5 px-2 py-0.5 rounded border border-emerald-400/10">{sel.selector}</div>
                                            </div>
                                            <button onClick={() => deleteSelector(sel.id)} className="opacity-0 group-hover:opacity-100 p-2 text-neutral-600 hover:text-red-400 transition-all"><Trash2 className="w-4 h-4"/></button>
                                        </div>
                                    ))}
                                    {selectors.length === 0 && <div className="col-span-2 text-center py-10 text-neutral-600 italic text-sm">No selectors defined for this page</div>}
                                </div>
                             </div>
                        </div>
                    ) : activeTab === 'analytics' ? (
                        <div className="animate-in fade-in slide-in-from-right-8 duration-700">
                             <AnalyticsDashboard stats={stats} history={runHistory} />
                        </div>
                    ) : activeTab === 'history' ? (
                        <div className="h-[750px] animate-in fade-in slide-in-from-right-8 duration-700">
                             <ExecutionHistory runs={runHistory} onOpenScript={(path) => {
                                 setActiveTab('tests');
                                 loadFile(path);
                             }} />
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-neutral-600 space-y-6 animate-in fade-in duration-700">
                             <div className="p-8 bg-neutral-900/50 rounded-full border border-neutral-800 shadow-inner group transition-all hover:scale-110 hover:border-purple-500/30">
                                <FolderOpen className="w-16 h-16 opacity-20 group-hover:opacity-100 group-hover:text-purple-500 transition-all" />
                             </div>
                             <div className="text-center space-y-2">
                                <p className="text-lg font-bold text-neutral-300">Welcome to Management Center</p>
                                <p className="text-sm text-neutral-500">Select a file from the explorer or create a new one to get started</p>
                             </div>
                             <div className="flex gap-4">
                                <button onClick={openCreateFile} className="flex items-center space-x-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-purple-900/20 hover:shadow-purple-900/40">
                                    <Plus className="w-5 h-5" /><span>Create Script</span>
                                </button>
                                <button onClick={openCreatePage} className="flex items-center space-x-2 px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl font-bold transition-all border border-neutral-700">
                                    <LayoutTemplate className="w-5 h-5" /><span>Create Page Object</span>
                                </button>
                             </div>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
