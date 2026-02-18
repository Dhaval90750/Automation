'use client';

import { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { Loader2, Play, Search, Terminal, FileCode, Save, Plus, FolderOpen, Lock, ChevronDown, ChevronUp, Video, Eye, EyeOff, LayoutTemplate, Database, Trash2, StopCircle, Sparkles, MessageSquare, Clock, Square, RefreshCw, ChevronRight, Settings2, Code2, Rocket, Globe, Wand2, Monitor, Layout, Sidebar, History, Calendar, FileText, CheckCircle2, XCircle } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6'];

// Helper Components 
const VisualComparisonSlider = ({ baseline, actual, diff }: { baseline?: string, actual?: string, diff?: string }) => {
    const [sliderPos, setSliderPos] = useState(50);
    const [selectedView, setSelectedView] = useState<'slider' | 'diff'>('slider');
    if (!baseline || !actual) return <div className="h-64 flex items-center justify-center text-neutral-600 italic">Select a snapshot to compare</div>;
    return (
        <div className="space-y-4">
            <div className="flex bg-neutral-800 rounded p-1 w-fit">
                <button onClick={() => setSelectedView('slider')} className={cn("px-3 py-1 text-xs rounded", selectedView === 'slider' ? "bg-neutral-700 text-white" : "text-neutral-500")}>Slider</button>
                <button onClick={() => setSelectedView('diff')} className={cn("px-3 py-1 text-xs rounded", selectedView === 'diff' ? "bg-neutral-700 text-white" : "text-neutral-500")}>Highlight Diff</button>
            </div>
            <div className="relative h-[400px] border border-neutral-800 rounded-2xl overflow-hidden bg-black flex items-center justify-center shadow-2xl">
                {selectedView === 'slider' ? (
                    <>
                        <img src={actual} className="absolute inset-0 w-full h-full object-contain" alt="Actual" />
                        <div className="absolute inset-0 w-full h-full" style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}>
                            <img src={baseline} className="absolute inset-0 w-full h-full object-contain" alt="Baseline" />
                        </div>
                        <div className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-10" style={{ left: `${sliderPos}%` }}>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-2xl flex items-center justify-center"><Search className="w-4 h-4 text-black" /></div>
                        </div>
                        <input type="range" min="0" max="100" value={sliderPos} onChange={(e) => setSliderPos(parseInt(e.target.value))} className="absolute inset-0 opacity-0 cursor-ew-resize z-20" />
                    </>
                ) : <img src={diff} className="w-full h-full object-contain" alt="Diff" />}
            </div>
        </div>
    );
};

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
                    <div key={step.id} className="group relative flex items-center space-x-3 bg-neutral-950/50 p-3 rounded-xl border border-neutral-800 hover:border-neutral-700 transition-all">
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

export default function ManagementPage() {
    const [activeTab, setActiveTab] = useState<'tests' | 'pom' | 'analytics' | 'history' | 'cicd' | 'bdd' | 'suites'>('tests');
    const [files, setFiles] = useState<any[]>([]);
    const [selectedFile, setSelectedFile] = useState<string | null>(null);
    const [fileContent, setFileContent] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
    const [pages, setPages] = useState<any[]>([]);
    const [selectedPage, setSelectedPage] = useState<any>(null);
    const [selectors, setSelectors] = useState<any[]>([]);
    const [pageTests, setPageTests] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [runHistory, setRunHistory] = useState<any[]>([]);
    const [jobs, setJobs] = useState<any[]>([]);
    const [suites, setSuites] = useState<{ [tag: string]: any[] }>({});
    const [bddTags, setBddTags] = useState<string>('');
    const [snapshots, setSnapshots] = useState<string[]>([]);
    const [selectedSnapshot, setSelectedSnapshot] = useState<string>('');
    const [visualImages, setVisualImages] = useState<{ baseline?: string, actual?: string, diff?: string }>({});

    useEffect(() => {
        fetchFiles(); fetchPages(); fetchJobs(); fetchSuites(); fetchReports();
    }, []);

    const fetchFiles = async () => { const res = await fetch('/api/files'); const json = await res.json(); if (json.success) setFiles(json.files); };
    const fetchPages = async () => { const res = await fetch('/api/pom?type=pages'); const json = await res.json(); if (json.success) setPages(json.data); };
    const fetchSelectors = async (pageId: number) => { const res = await fetch(`/api/pom?type=selectors&pageId=${pageId}`); const json = await res.json(); if (json.success) setSelectors(json.data); };
    const fetchJobs = async () => { const res = await fetch('/api/jobs'); const json = await res.json(); if (json.success) setJobs(json.jobs); };
    const fetchSuites = async () => { const res = await fetch('/api/suites'); const json = await res.json(); if (json.success) setSuites(json.suites); };
    const fetchReports = async () => { const res = await fetch('/api/reports'); const json = await res.json(); if (json.success) { setStats(json.stats); setRunHistory(json.runs); } };
    const fetchSnapshots = async () => { const res = await fetch('/api/visual'); const json = await res.json(); if (json.success) setSnapshots(json.snapshots); };
    
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

    const createFile = async () => {
        const name = prompt('Enter file name (e.g. login.py):');
        if (!name) return;
        const res = await fetch('/api/files', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path: name, content: name.endsWith('.json') ? '[]' : '# New Test Script' })
        });
        if ((await res.json()).success) fetchFiles();
    };

    const deleteFile = async (path: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm(`Delete ${path}?`)) return;
        const res = await fetch(`/api/files?path=${path}`, { method: 'DELETE' });
        if ((await res.json()).success) {
            if (selectedFile === path) { setSelectedFile(null); setFileContent(''); }
            fetchFiles();
        }
    };

    const createPage = async () => {
        const name = prompt('Enter page name:');
        const url = prompt('Enter base URL:');
        if (!name) return;
        const res = await fetch('/api/pom', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'page', name, url, description: '' })
        });
        if ((await res.json()).success) fetchPages();
    };

    const deletePage = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Delete this page and its selectors?')) return;
        const res = await fetch(`/api/pom?type=page&id=${id}`, { method: 'DELETE' });
        if ((await res.json()).success) {
            if (selectedPage?.id === id) setSelectedPage(null);
            fetchPages();
        }
    };

    useEffect(() => {
        if (selectedPage) fetchSelectors(selectedPage.id);
    }, [selectedPage]);

    const addSelector = async () => {
        if (!selectedPage) return;
        const name = prompt('Selector Name:');
        const selectorValue = prompt('Selector (CSS/XPath):');
        if (!name || !selectorValue) return;
        const res = await fetch('/api/pom', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'selector', pageId: selectedPage.id, name, selector: selectorValue, elementType: 'button' })
        });
        if ((await res.json()).success) fetchSelectors(selectedPage.id);
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
            <header className="flex items-center justify-between border-b border-neutral-800 pb-6">
                <div className="flex items-center space-x-4">
                    <div className="p-3 bg-purple-600 rounded-lg shadow-lg shadow-purple-900/20 hover:scale-105 transition-transform"><Layout className="w-6 h-6 text-white" /></div>
                    <div><h1 className="text-2xl font-bold text-white tracking-tight">Automation Management</h1><p className="text-neutral-500 text-sm font-medium">Unified Control Plane for Test Ecosystem</p></div>
                </div>
                <div className="flex items-center space-x-3">
                    <a href="/" className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-lg text-sm font-bold border border-neutral-800 transition-all flex items-center space-x-2">
                        <Monitor className="w-4 h-4" /><span>Live Dashboard</span>
                    </a>
                </div>
            </header>

            <div className="flex bg-neutral-900/50 border border-neutral-100/5 backdrop-blur-md rounded-2xl p-1.5 w-fit self-center shadow-2xl">
                {[
                    { id: 'tests', label: 'Test Scripts', icon: FileCode },
                    { id: 'pom', label: 'Page Objects', icon: LayoutTemplate },
                    { id: 'analytics', label: 'Analytics', icon: History },
                    { id: 'history', label: 'History', icon: Clock },
                    { id: 'cicd', label: 'CI/CD', icon: Rocket },
                    { id: 'bdd', label: 'BDD', icon: Sparkles },
                    { id: 'suites', label: 'Suites', icon: Layout },
                ].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={cn("flex items-center space-x-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300", activeTab === tab.id ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.15)] scale-105" : "text-neutral-500 hover:text-neutral-100 hover:bg-white/5")}>
                        <tab.icon className="w-4 h-4" /><span>{tab.label}</span>
                    </button>
                ))}
            </div>

            <main className="grid grid-cols-12 gap-8 flex-1">
                <aside className="col-span-3 bg-neutral-900/80 backdrop-blur-sm border border-neutral-800 rounded-3xl overflow-hidden flex flex-col h-[750px] shadow-2xl">
                    <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
                        <span className="font-black text-[10px] uppercase text-neutral-600 tracking-[0.2em]">Management Explorer</span>
                        <div className="flex items-center space-x-2">
                             {activeTab === 'tests' && <button onClick={createFile} className="p-1 hover:bg-neutral-800 rounded text-purple-400" title="New Script"><Plus className="w-4 h-4" /></button>}
                             {activeTab === 'pom' && <button onClick={createPage} className="p-1 hover:bg-neutral-800 rounded text-emerald-400" title="New Page"><Plus className="w-4 h-4" /></button>}
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-1">
                        {activeTab === 'tests' && files.map(file => (
                            <div key={file.path} className="group relative">
                                <button onClick={() => loadFile(file.path)} className={cn("w-full text-left px-4 py-3 rounded-2xl text-sm flex items-center space-x-3 transition-all duration-200 group-hover:pr-10", selectedFile === file.path ? "bg-purple-600 text-white shadow-lg shadow-purple-900/40" : "hover:bg-neutral-800/50 text-neutral-400")}>
                                    <FileCode className={cn("w-4 h-4", selectedFile === file.path ? "text-white" : "text-purple-500")} /><span className="truncate font-medium">{file.name}</span>
                                </button>
                                <button onClick={(e) => deleteFile(file.path, e)} className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/10 text-neutral-600 hover:text-red-400 rounded-lg transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                        ))}
                        {activeTab === 'pom' && pages.map(page => (
                            <div key={page.id} className="group relative">
                                <button onClick={() => setSelectedPage(page)} className={cn("w-full text-left px-4 py-3 rounded-2xl text-sm flex items-center space-x-3 transition-all duration-200 group-hover:pr-10", selectedPage?.id === page.id ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/40" : "hover:bg-neutral-800/50 text-neutral-400")}>
                                    <LayoutTemplate className={cn("w-4 h-4", selectedPage?.id === page.id ? "text-white" : "text-emerald-500")} /><span className="truncate font-medium">{page.name}</span>
                                </button>
                                <button onClick={(e) => deletePage(page.id, e)} className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/10 text-neutral-600 hover:text-red-400 rounded-lg transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
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
                                    return <NoCodeStepBuilder steps={steps} onStepsChange={(newSteps) => setFileContent(JSON.stringify(newSteps, null, 2))} />;
                                } catch (e) {
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
                                    <button onClick={addSelector} className="flex items-center space-x-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition-all shadow-lg shadow-emerald-900/20"><Plus className="w-4 h-4" /><span>ADD SELECTOR</span></button>
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
                        <div className="h-full flex flex-col items-center justify-center text-neutral-600 space-y-4 animate-in fade-in duration-700">
                             <div className="p-8 bg-neutral-900/50 rounded-full border border-neutral-800 shadow-inner"><FolderOpen className="w-16 h-16 opacity-10" /></div>
                             <p className="text-sm font-medium tracking-wide">Select a module from the explorer to begin management</p>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
