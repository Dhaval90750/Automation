'use strict';
'use client';

import { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { 
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    BarChart, Bar, AreaChart, Area 
} from 'recharts';
import { 
    Loader2, Play, Search, Terminal, FileCode, Save, Plus, Lock, ChevronDown, ChevronUp, Video, Eye, EyeOff, LayoutTemplate, Database, Trash2, StopCircle, Sparkles, Clock, Square, RefreshCw, ChevronRight, Rocket, Wand2, Layout, History, Calendar, FileText, CheckCircle2 
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const VisualComparisonSlider = ({ baseline, actual, diff }: { baseline?: string, actual?: string, diff?: string }) => {
    const [sliderPos, setSliderPos] = useState(50);
    const [selectedView, setSelectedView] = useState<'slider' | 'diff'>('slider');

    if (!baseline || !actual) return <div className="h-64 flex items-center justify-center text-neutral-600 italic">Select a snapshot to compare</div>;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex bg-neutral-800 rounded p-1">
                    <button onClick={() => setSelectedView('slider')} className={cn("px-3 py-1 text-xs rounded", selectedView === 'slider' ? "bg-neutral-700 text-white" : "text-neutral-500")}>Slider</button>
                    <button onClick={() => setSelectedView('diff')} className={cn("px-3 py-1 text-xs rounded", selectedView === 'diff' ? "bg-neutral-700 text-white" : "text-neutral-500")}>Highlight Diff</button>
                </div>
            </div>

            <div className="relative h-[400px] border border-neutral-800 rounded-2xl overflow-hidden bg-black flex items-center justify-center shadow-2xl">
                {selectedView === 'slider' ? (
                    <>
                        <img src={actual} className="absolute inset-0 w-full h-full object-contain" alt="Actual" />
                        <div 
                            className="absolute inset-0 w-full h-full" 
                            style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
                        >
                            <img src={baseline} className="absolute inset-0 w-full h-full object-contain" alt="Baseline" />
                        </div>
                        <div 
                            className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-10" 
                            style={{ left: `${sliderPos}%` }}
                        >
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-2xl flex items-center justify-center">
                                <Search className="w-4 h-4 text-black" />
                            </div>
                        </div>
                        <input 
                            type="range" 
                            min="0" max="100" 
                            value={sliderPos} 
                            onChange={(e) => setSliderPos(parseInt(e.target.value))}
                            className="absolute inset-0 opacity-0 cursor-ew-resize z-20"
                        />
                    </>
                ) : (
                    <img src={diff} className="w-full h-full object-contain" alt="Diff" />
                )}
            </div>
            <div className="flex justify-between text-[10px] uppercase font-bold text-neutral-500 tracking-widest px-2">
                <span>Baseline (Old)</span>
                <span>Actual (Current)</span>
            </div>
        </div>
    );
};

const AnalyticsDashboard = ({ stats, history }: { stats: any, history: any[] }) => {
    const timelineData = history?.length > 0 ? history.map((run: any) => ({
        timestamp: run.created_at || run.timestamp,
        duration: (run.duration_ms || run.duration) / 1000,
        status: run.status === 'passed' || run.results?.every((r:any) => r.success) ? 1 : 0
    })) : [
        { timestamp: '2026-02-18T10:00:00Z', duration: 12, status: 1 },
        { timestamp: '2026-02-18T10:15:00Z', duration: 15, status: 0 },
        { timestamp: '2026-02-18T10:30:00Z', duration: 9, status: 1 },
        { timestamp: '2026-02-18T10:45:00Z', duration: 11, status: 1 },
        { timestamp: '2026-02-18T11:00:00Z', duration: 14, status: 1 }
    ];

    const trendData = history?.length > 0 ? history.slice(-7).map(run => ({
        name: new Date(run.timestamp || run.created_at).toLocaleDateString(),
        success: run.results?.filter((r: any) => r.success).length || (run.status === 'passed' ? 1 : 0),
        failed: run.results?.filter((r: any) => !r.success).length || (run.status === 'failed' ? 1 : 0),
        time: (run.duration || run.duration_ms) / 1000
    })) : [
        { name: 'Mon', success: 4, failed: 1, time: 12 },
        { name: 'Tue', success: 6, failed: 0, time: 10 },
        { name: 'Wed', success: 5, failed: 2, time: 15 },
        { name: 'Thu', success: 8, failed: 0, time: 9 },
        { name: 'Fri', success: 3, failed: 1, time: 18 },
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Top Row Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: 'Avg Success Rate', value: '94%', icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                    { label: 'Total Runs (24h)', value: '128', icon: Rocket, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                    { label: 'Avg Duration', value: '14.2s', icon: Clock, color: 'text-purple-400', bg: 'bg-purple-500/10' },
                    { label: 'Flaky Tests', value: '3', icon: Wand2, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
                ].map((stat, i) => (
                    <div key={i} className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl shadow-xl hover:border-neutral-700 transition-all">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">{stat.label}</span>
                            <div className={cn("p-1.5 rounded-lg", stat.bg)}>
                                <stat.icon className={cn("w-3.5 h-3.5", stat.color)} />
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-white">{stat.value}</div>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Execution Trends */}
                <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl shadow-xl">
                    <div className="flex items-center justify-between mb-6">
                        <h4 className="text-sm font-bold text-neutral-300 flex items-center space-x-2">
                            <History className="w-4 h-4 text-emerald-500" />
                            <span>Execution Success Trends</span>
                        </h4>
                    </div>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData}>
                                <defs>
                                    <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                                <XAxis dataKey="name" stroke="#525252" fontSize={10} axisLine={false} tickLine={false} />
                                <YAxis stroke="#525252" fontSize={10} axisLine={false} tickLine={false} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626', borderRadius: '8px' }}
                                    itemStyle={{ fontSize: '10px' }}
                                />
                                <Area type="monotone" dataKey="success" stroke="#10b981" fillOpacity={1} fill="url(#colorSuccess)" />
                                <Area type="monotone" dataKey="failed" stroke="#ef4444" fill="transparent" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Performance */}
                <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl shadow-xl">
                    <div className="flex items-center justify-between mb-6">
                        <h4 className="text-sm font-bold text-neutral-300 flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-blue-500" />
                            <span>Run Duration (Seconds)</span>
                        </h4>
                    </div>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                                <XAxis dataKey="name" stroke="#525252" fontSize={10} axisLine={false} tickLine={false} tick={{fill: '#525252'}} />
                                <YAxis stroke="#525252" fontSize={10} axisLine={false} tickLine={false} tick={{fill: '#525252'}} />
                                <Tooltip 
                                    cursor={{fill: '#262626'}}
                                    contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626', borderRadius: '8px' }}
                                />
                                <Bar dataKey="time" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Execution Timeline (Visual Analytics) */}
            <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl shadow-xl">
                <div className="flex items-center justify-between mb-6">
                    <h4 className="text-sm font-bold text-neutral-300 flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-purple-500" />
                        <span>Execution Timeline (Heatmap)</span>
                    </h4>
                </div>
                <div className="grid grid-cols-12 gap-1 px-4 h-8">
                    {timelineData.slice(-48).map((run, i) => (
                        <div 
                            key={i} 
                            className={cn("h-full rounded-sm cursor-help transition-all", run.status ? "bg-emerald-500/50 hover:bg-emerald-400" : "bg-red-500/50 hover:bg-red-400")}
                            title={`${new Date(run.timestamp).toLocaleString()}\nDuration: ${run.duration}s`}
                        />
                    ))}
                </div>
                <div className="flex justify-between mt-2 px-4 text-[9px] text-neutral-600 font-bold uppercase tracking-widest">
                    <span>Earlier</span>
                    <span>Recent</span>
                </div>
            </div>
        </div>
    );
};

const AiAssistantSidebar = ({ onSuggestion }: { onSuggestion: (steps: any[]) => void }) => {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAsk = async () => {
        if (!query) return;
        setLoading(true);
        try {
            const res = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: query })
            });
            const json = await res.json();
            if (json.success && json.steps) {
                // Ensure all steps have unique IDs for React keys
                const stepsWithIds = json.steps.map((s: any) => ({
                    ...s,
                    id: s.id || Math.random().toString(36).substr(2, 9)
                }));
                onSuggestion(stepsWithIds);
            }
        } catch (e) {
            console.error("AI Assistant Error", e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-neutral-900/50 border-l border-neutral-800 w-80 animate-in slide-in-from-right duration-500">
            <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-bold text-neutral-200">AI Assistant</span>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-400 leading-relaxed italic">
                    &quot;I can help you convert natural language into test steps. Try: &apos;Login to portal and check for dashboard title&apos;.&quot;
                </div>
            </div>
            <div className="p-4 border-t border-neutral-800 bg-neutral-900">
                <div className="relative">
                    <textarea 
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Ask for test logic..."
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-xs text-neutral-200 outline-none focus:ring-1 focus:ring-purple-500 resize-none h-20"
                    />
                    <button 
                        onClick={handleAsk}
                        disabled={loading || !query}
                        className="absolute bottom-2 right-2 p-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-md disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                    </button>
                </div>
            </div>
        </div>
    );
};

const NoCodeStepBuilder = ({ steps, onStepsChange }: { steps: any[], onStepsChange: (steps: any[]) => void }) => {
    const addStep = () => {
        const newStep = { id: Date.now().toString(), action: 'click', value: '', selector: '' };
        onStepsChange([...steps, newStep]);
    };

    const updateStep = (id: string, field: string, val: any) => {
        onStepsChange(steps.map(s => s.id === id ? { ...s, [field]: val } : s));
    };

    const removeStep = (id: string) => {
        onStepsChange(steps.filter(s => s.id !== id));
    };

    return (
        <div className="space-y-3 p-4 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-widest">No-Code Logic Builder</h4>
                <button onClick={addStep} className="p-1 hover:bg-neutral-800 rounded text-emerald-500"><Plus className="w-3.5 h-3.5" /></button>
            </div>
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-neutral-800">
                {steps.map((step, idx) => (
                    <div key={step.id || `step-${idx}`} className="group relative flex items-center space-x-3 bg-neutral-950/50 p-3 rounded-xl border border-neutral-800 hover:border-neutral-700 transition-all">
                        <span className="text-[10px] font-bold text-neutral-700 w-4">{idx + 1}</span>
                        <select 
                            value={step.action}
                            onChange={(e) => updateStep(step.id, 'action', e.target.value)}
                            className="bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-[10px] text-blue-400 outline-none"
                        >
                            <option value="goto">Navigate</option>
                            <option value="click">Click</option>
                            <option value="type">Type</option>
                            <option value="assertion">Verify</option>
                            <option value="waitFor">Wait For</option>
                        </select>
                        <input 
                            type="text"
                            placeholder="Value / Selector"
                            value={step.value || step.selector}
                            onChange={(e) => updateStep(step.id, step.action === 'goto' || step.action === 'assertion' ? 'value' : 'selector', e.target.value)}
                            className="flex-1 bg-transparent border-b border-neutral-800 focus:border-emerald-500 text-[11px] text-neutral-300 outline-none py-1"
                        />
                        <button onClick={() => removeStep(step.id)} className="opacity-0 group-hover:opacity-100 p-1 text-neutral-600 hover:text-red-400 transition-all"><Trash2 className="w-3 h-3"/></button>
                    </div>
                ))}
                {steps.length === 0 && <div className="text-center py-8 text-neutral-700 text-xs italic">Drag or add steps to begin</div>}
            </div>
        </div>
    );
};

const TerminalWindow = ({ logs, onClear }: { logs: string[], onClear: () => void }) => {
    const formatLog = (log: string) => {
        if (log.toLowerCase().includes('failed') || log.toLowerCase().includes('error')) 
            return <span className="text-red-400 font-bold">{log}</span>;
        if (log.toLowerCase().includes('passed') || log.toLowerCase().includes('successfully') || log.toLowerCase().includes('completed')) 
            return <span className="text-emerald-400 font-bold">{log}</span>;
        if (log.toLowerCase().includes('executing') || log.toLowerCase().includes('starting')) 
            return <span className="text-blue-400">{log}</span>;
        if (log.toLowerCase().includes('resolving') || log.toLowerCase().includes('healed')) 
            return <span className="text-yellow-400 italic">{log}</span>;
        return <span className="text-neutral-400">{log}</span>;
    };

    return (
        <div className="mt-6 border border-neutral-800 rounded-xl overflow-hidden bg-black shadow-2xl relative">
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%]"></div>
            <div className="bg-neutral-900/80 backdrop-blur-md px-4 py-2 border-b border-neutral-800 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Terminal className="w-4 h-4 text-emerald-500" />
                    <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-widest">Live Terminal Output</span>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1.5">
                        <div className="w-2 h-2 rounded-full bg-red-500/80 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                        <div className="w-2 h-2 rounded-full bg-yellow-500/80"></div>
                        <div className="w-2 h-2 rounded-full bg-emerald-500/80 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                    </div>
                </div>
            </div>
            <div className="h-[250px] overflow-y-auto p-4 font-mono text-[11px] leading-relaxed scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent">
                {logs.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-neutral-700 space-y-2">
                        <Terminal className="w-8 h-8 opacity-20" />
                        <p className="animate-pulse">Waiting for test execution...</p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {logs.map((log, i) => (
                            <div key={i} className="flex space-x-2 group">
                                <span className="text-neutral-600 select-none min-w-[20px]">{i + 1}</span>
                                <div className="break-all">{formatLog(log)}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {logs.length > 0 && (
                <button 
                    onClick={onClear}
                    className="absolute bottom-4 right-4 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 px-2 py-1 rounded text-[9px] uppercase tracking-tighter transition-all border border-neutral-700/50"
                >
                    Clear Terminal
                </button>
            )}
        </div>
    );
};

const baseline = "/placeholder.png";
const actual = "/placeholder.png";

interface FileNode {
    path: string;
    name: string;
    type: 'file' | 'directory';
    children?: FileNode[];
}

interface SelectedFile {
    path: string;
    name: string;
    type: string;
}

export default function CommandPage() {
    const fetchHistory = () => {}; // Stub for now or needs implementation

  // Scraper State
  const [url, setUrl] = useState('');
  const [selector, setSelector] = useState('');
  const [scrapeData, setScrapeData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [headless, setHeadless] = useState(false);
  
  // Recorder State
  const [recording, setRecording] = useState(false);
  const [recordedCode, setRecordedCode] = useState('');
  const [recorderLang, setRecorderLang] = useState<'javascript' | 'python'>('javascript');

  // AI Copilot State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSteps, setAiSteps] = useState<any[] | null>(null);
  const [aiPythonCode, setAiPythonCode] = useState<string>('');
  const [aiRawResponse, setAiRawResponse] = useState<string>('');
  const [viewMode, setViewMode] = useState<'json' | 'python' | 'raw'>('json');

  // Login State
  const [showLogin, setShowLogin] = useState(false);
  const [loginConfig, setLoginConfig] = useState({
      enabled: false,
      url: '',
      username: '',
      password: '',
      usernameSelector: 'input[type="text"], input[type="email"]',
      passwordSelector: 'input[type="password"]',
      submitSelector: 'button[type="submit"]'
  });

  // File Manager State
  const [files, setFiles] = useState<FileNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [fileContent, setFileContent] = useState('');
  const [testResult, setTestResult] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);

  // Reporting State
  const [activeTab, setActiveTab] = useState<'tests' | 'pom' | 'reports' | 'scheduling' | 'cicd' | 'bdd' | 'suites'>('tests');
  const [stats, setStats] = useState<any>(null);
  const [runHistory, setRunHistory] = useState<any[]>([]);

  // POM State
  const [pages, setPages] = useState<any[]>([]);
  const [selectedPage, setSelectedPage] = useState<any>(null);
  const [selectors, setSelectors] = useState<any[]>([]);
  const [pageTests, setPageTests] = useState<any[]>([]);
  const [dataFiles, setDataFiles] = useState<any[]>([]);
  const [bddFeatures, setBddFeatures] = useState<string[]>([]);
  const [bddTags, setBddTags] = useState<string>('');
  const [bddResult, setBddResult] = useState<any>(null);
  const [selectedDataFile, setSelectedDataFile] = useState<string>('');
  const [dataPreview, setDataPreview] = useState<any[]>([]);
  const [dataColumns, setDataColumns] = useState<string[]>([]);
  
  // Scheduling State
  const [jobs, setJobs] = useState<any[]>([]);

  // Suites State
  const [suites, setSuites] = useState<{ [tag: string]: any[] }>({});
  const [suiteResult, setSuiteResult] = useState<any>(null);
  const [concurrency, setConcurrency] = useState(1);

  // CI/CD State
  const [ciConfig, setCiConfig] = useState({ provider: 'github', trigger: 'push', scheduleCron: '0 0 * * *' });
  const [generatedYaml, setGeneratedYaml] = useState('');

  // Visual Regression State
  const [snapshots, setSnapshots] = useState<string[]>([]);
  const [selectedSnapshot, setSelectedSnapshot] = useState<string>('');
  const [visualImages, setVisualImages] = useState<{ baseline?: string, actual?: string, diff?: string }>({});

  // Terminal State
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [terminalLogs]);


  // UI Panels
  const [showAiSidebar, setShowAiSidebar] = useState(false);

  useEffect(() => {
    fetchFiles();
    fetchPages();
    fetchJobs();
    fetchDataFiles();
    fetchSuites();
  }, []);

  const fetchSuites = async () => {
      const res = await fetch('/api/suites');
      const json = await res.json();
      if (json.success) setSuites(json.suites);
  };

  const fetchSnapshots = async () => {
      const res = await fetch('/api/visual');
      const json = await res.json();
      if (json.success) setSnapshots(json.snapshots);
  };

  const loadSnapshotData = async (name: string) => {
      setSelectedSnapshot(name);
      if (!name) return;
      const types = ['baseline', 'actual', 'diff'];
      const images: any = {};
      for (const type of types) {
          const res = await fetch(`/api/visual?type=${type}&name=${name}`);
          const json = await res.json();
          if (json.success) images[type] = json.image;
      }
      setVisualImages(images);
  };

  const stopTest = async () => {
      try {
          const res = await fetch('/api/tests/stop', { method: 'POST' });
          const json = await res.json();
          if (json.success) {
              setIsRunning(false);
          }
      } catch (e: any) {
          console.error("Failed to stop test:", e);
      }
  };

  const fetchJobs = async () => {
      const res = await fetch('/api/jobs');
      const json = await res.json();
      if (json.success) setJobs(json.jobs);
  };

  const createJob = async () => {
      if (!selectedFile) {
          alert("Please select a test file first to schedule it.");
          return;
      }
      const schedule = prompt("Enter Cron Schedule (e.g. '* * * * *' for every minute):", "* * * * *");
      if (!schedule) return;

      const res = await fetch('/api/jobs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ test_name: selectedFile, schedule })
      });
      const json = await res.json();
      if (json.success) {
          fetchJobs();
          setActiveTab('scheduling');
      } else {
          alert("Error: " + json.error);
      }
  };

  const deleteJob = async (id: number) => {
      if(!confirm("Stop and delete this job?")) return;
      await fetch(`/api/jobs?id=${id}`, { method: 'DELETE' });
      fetchJobs();
  };

  const fetchFiles = async () => {
    const res = await fetch('/api/files');
    const json = await res.json();
    if (json.success) setFiles(json.files);
  };

  const fetchPages = async () => {
      const res = await fetch('/api/pom?type=pages');
      const json = await res.json();
      if (json.success) setPages(json.data);
  };

  const fetchDataFiles = async () => {
      const res = await fetch('/api/files'); 
      const json = await res.json();
      if (json.success && json.files) {
          setDataFiles(json.files.filter((f: any) => f.name.endsWith('.csv') || f.name.endsWith('.json')));
      }
  };

  const loadDataContent = async (path: string) => {
      setSelectedDataFile(path);
      if (!path) {
          setDataPreview([]);
          setDataColumns([]);
          return;
      }
      const res = await fetch(`/api/data?path=${path}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
          setDataPreview(json.data.slice(0, 5));
          if (json.data.length > 0) {
              setDataColumns(Object.keys(json.data[0]));
          }
      }
  };

  const fetchSelectors = async (pageId: number) => {
      const res = await fetch(`/api/pom?type=selectors&pageId=${pageId}`);
      const json = await res.json();
      if (json.success) setSelectors(json.data);
      
      const resTests = await fetch(`/api/pom?type=tests&pageId=${pageId}`);
      const jsonTests = await resTests.json();
      if (jsonTests.success) setPageTests(jsonTests.data);
  };

  const fetchReports = async () => {
    const res = await fetch('/api/reports');
    const json = await res.json();
    if (json.success) {
        setStats(json.stats);
        setRunHistory(json.runs);
    }
  };

  const loadFile = async (path: string) => {
    setSelectedFile({ path, name: path.split('/').pop() || '', type: 'file' });
    const res = await fetch(`/api/files/read?path=${path}`);
    const json = await res.json();
    if (json.success) {
      if (typeof json.content === 'string' || (json.content && json.content.raw)) {
          setFileContent(json.content.raw || json.content);
      } else {
          setFileContent(JSON.stringify(json.content, null, 2));
      }
    }
  };

  const runCommand = async () => {
        if (!selectedFile) return;
        setIsRunning(true);
        setTerminalLogs(['Initializing execution...', `Target: ${selectedFile.path}`]);
        
        try {
            const response = await fetch('/api/tests/exec', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path: selectedFile.path })
            });

            if (!response.body) return;

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            
            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                
                const text = decoder.decode(value);
                const lines = text.split('\n'); 
                setTerminalLogs(prev => [...prev, ...lines]);
            }

            setTerminalLogs(prev => [...prev, '--- Execution Finished ---']);
            fetchHistory(); 
            
        } catch (e: any) {
             setTerminalLogs(prev => [...prev, `Error: ${e.message}`]);
        } finally {
            setIsRunning(false);
        }
    };

  const saveFile = async () => {
    if (!selectedFile) return;
    try {
      let contentToSave = fileContent;
      // Try parsing if it looks like JSON and we expect JSON (simple heuristic)
      if (selectedFile.path.endsWith('.json')) {
          try {
             contentToSave = JSON.parse(fileContent);
          } catch(e) { /* ignore, save as string/invalid json */ }
      }

      await fetch('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: selectedFile.path, content: contentToSave }),
      });
      alert('File Saved!');
      fetchFiles();
    } catch (e) {
      alert('Invalid JSON');
    }
  };

  const runTest = async () => {
    setIsRunning(true);
    setTestResult(null);
    setTerminalLogs(["Initializing test execution..."]);
    try {
      if (selectedFile?.path.endsWith('.json')) {
          const steps = JSON.parse(fileContent);
          const res = await fetch('/api/tests/run', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ steps }),
          });
          const json = await res.json();
          setTestResult(json.result);
          if (json.result?.logs) setTerminalLogs(prev => [...prev, ...json.result.logs]);
      } else if (selectedFile) {
          // Execute code file directly - Streaming
          const response = await fetch('/api/tests/exec', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ path: selectedFile.path })
          });

          if (!response.body) {
              const json = await response.json();
              if (json.error) {
                   setTerminalLogs(prev => [...prev, `Error: ${json.error}`]);
                   setTestResult({ success: false, logs: [json.error] });
              }
              return;
          }

          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          
          while (true) {
              const { value, done } = await reader.read();
              if (done) break;
              
              const text = decoder.decode(value);
              const lines = text.split('\n'); 
              setTerminalLogs(prev => [...prev, ...lines]);
          }
          
          setTestResult({
              success: true,
              logs: [], // Logs are already streamed
              duration: 0
          });
          fetchHistory();
      } else {
          alert("No file selected.");
      }
    } catch (e: any) {
      const errorLog = `Error: ${e.message}`;
      setTestResult({ success: false, logs: [errorLog] });
      setTerminalLogs(prev => [...prev, errorLog]);
    } finally {
      setIsRunning(false);
    }
  };

  const createNewFile = async () => {
    const name = prompt('File Name (e.g. login-check.json):');
    if (!name) return;
    
    // Default template from recent scrape if available
    let content = [
      { id: '1', action: 'goto', value: url || 'https://example.com' },
      { id: '2', action: 'assertion', value: 'Example Domain' }
    ];

    if (scrapeData && scrapeData.url) {
        content = [
            { id: '1', action: 'goto', value: scrapeData.url },
            { id: '2', action: 'assertion', value: scrapeData.title || '' }
        ];
    } else if (aiSteps) {
        content = aiSteps;
    }

    await fetch('/api/files', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: name, content }),
    });
    fetchFiles();
    loadFile(name);
  };

  const createNewPage = async () => {
      const name = prompt('Page Name (e.g. LoginPage):');
      if (!name) return;
      await fetch('/api/pom', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'page', name, url: url || '' }),
      });
      fetchPages();
  };

  const addSelector = async () => {
      if (!selectedPage) return;
      const name = prompt('Selector Name (e.g. username_input):');
      const sel = prompt('Selector Value (e.g. #username):', selector || '');
      if (!name || !sel) return;

      await fetch('/api/pom', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
              type: 'selector', 
              pageId: selectedPage.id, 
              name, 
              selector: sel,
              elementType: 'element'
          }),
      });
      fetchSelectors(selectedPage.id);
  };

  const addPageTest = async () => {
      if (!selectedPage) return;
      const name = prompt('Test Name (e.g. Valid Login):');
      if (!name) return;
      
      // Default template
      const content = [
          { id: '1', action: 'goto', value: selectedPage.url || 'https://example.com' }
      ];

      await fetch('/api/pom', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
              type: 'test', 
              pageId: selectedPage.id, 
              name, 
              steps: content,
              description: ''
          }),
      });
      fetchSelectors(selectedPage.id);
  };

  const runPageTest = async (test: any) => {
      setIsRunning(true);
      setTestResult(null);
      setTerminalLogs(["Starting runner for Page Object test..."]);
      try {
          const steps = JSON.parse(test.steps);
          const res = await fetch('/api/tests/run', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ steps }),
          });
          const json = await res.json();
          setTestResult(json.result);
          if (json.result?.logs) setTerminalLogs(prev => [...prev, ...json.result.logs]);
      } catch (e: any) {
          const errorLog = `Error: ${e.message}`;
          setTestResult({ success: false, logs: [errorLog] });
          setTerminalLogs(prev => [...prev, errorLog]);
      } finally {
          setIsRunning(false);
      }
  };

  const runBdd = async () => {
      setIsRunning(true);
      setBddResult(null);
      setTerminalLogs(["Spinning up Cucumber-js environment...", "Looking for feature files in /features..."]);
      try {
          const res = await fetch('/api/bdd/run', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ tags: bddTags })
          });
          const json = await res.json();
          const freshLogs = (json.logs || json.error || "").split('\n').filter((l: string) => l.trim() !== "");
          setBddResult({
              success: json.success,
              output: json.output || json.error
          });
          setTerminalLogs(prev => [...prev, ...freshLogs]);
      } catch (e: any) {
          const errorLog = `BDD Error: ${e.message}`;
          setBddResult({ success: false, output: e.message });
          setTerminalLogs(prev => [...prev, errorLog]);
      } finally {
          setIsRunning(false);
      }
  };



  const runSuite = async (tag: string) => {
      setIsRunning(true);
      setSuiteResult(null);
      setTerminalLogs([`Initializing Suite Run for tag: @${tag}`, `Concurrency set to: ${concurrency}`]);
      try {
          const res = await fetch('/api/suites/run', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ tag, concurrency })
          });
          const json = await res.json();
          setSuiteResult({
              tag,
              success: json.success,
              summary: json.summary,
              results: json.results
          });
          if (json.results) {
              const suiteLogs = json.results.map((r: any) => `[${r.success ? 'PASS' : 'FAIL'}] ${r.name} (${r.duration}ms)`);
              setTerminalLogs(prev => [...prev, ...suiteLogs, `--- Suite Execution Finished ---`]);
          }
      } catch (e: any) {
          const errorLog = `Suite Error: ${e.message}`;
          setTerminalLogs(prev => [...prev, errorLog]);
          alert("Suite Execution Failed: " + e.message);
      } finally {
          setIsRunning(false);
      }
  };

  const handleScrape = async () => {
    if (!url) return;
    setLoading(true);
    setError('');
    setScrapeData(null);
    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            url, 
            selector,
            login: loginConfig.enabled ? loginConfig : undefined,
            headless
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to scrape');
      setScrapeData(json.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const startRecorder = async () => {
      setRecording(true);
      setRecordedCode('');
      try {
          await fetch('/api/record', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'start', url, language: recorderLang }),
          });
      } catch (e) {
          alert('Failed to launch recorder');
          setRecording(false);
      }
  };

  const stopRecorder = async () => {
      try {
          const res = await fetch('/api/record', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'stop' }),
          });
          const json = await res.json();
          if (json.success) {
              setRecordedCode(json.code);
              setRecordedCode(json.code);
              // Auto-create a file with this code
              const name = prompt("Recording Finished! \n\nEnter a name to save this recording as (e.g. login-browsing):");
              if(name) {
                   // Save based on lang
                   const ext = recorderLang === 'python' ? '.py' : '.spec.ts';
                   const fileName = name.endsWith('.ts') || name.endsWith('.js') || name.endsWith('.py') ? name : name + ext;
                  
                  await fetch('/api/files', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ path: fileName, content: json.code }), // Send raw string
                  });
                  fetchFiles();
                  alert('Saved to ' + fileName);
              }
          } else {
              alert('Error: ' + json.error);
          }
      } catch (e) {
          alert('Failed to stop/save recorder');
      } finally {
          setRecording(false);
      }
  };

  const handleAiGenerate = async () => {
      if (!aiPrompt) return;
      setAiLoading(true);
      setAiSteps(null);
      try {
          const res = await fetch('/api/ai', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ prompt: aiPrompt })
          });
          const json = await res.json();
          if (json.success) {
              setAiSteps(json.steps);
              setAiPythonCode(json.pythonCode);
              setAiRawResponse(json.raw);
          } else {
              setAiRawResponse(json.raw || json.error);
              alert(json.error);
          }
      } catch (e) {
          alert("AI Generation Failed");
      } finally {
          setAiLoading(false);
      }
  };

  const runWithData = async () => {
      if (!selectedDataFile) return;
      setIsRunning(true);
      setTestResult(null);
      
      try {
          // 1. Fetch Data
          const dataRes = await fetch(`/api/data?path=${selectedDataFile}`);
          const dataJson = await dataRes.json();
          
          if (!dataJson.success || !Array.isArray(dataJson.data)) {
              alert("Failed to load valid data rows.");
              setIsRunning(false);
              return;
          }
          
          const rows = dataJson.data;
          let passedCount = 0;
          let totalLogs: string[] = [];
          setTerminalLogs([`Starting Data-Driven Execution using ${selectedDataFile}...`]);

          // 2. Iterate
          for (let i = 0; i < rows.length; i++) {
              const row = rows[i];
              const rowMsg = `--- Data Row ${i+1}/${rows.length} ---`;
              totalLogs.push(rowMsg);
              setTerminalLogs(prev => [...prev, rowMsg]);

              // Parse steps
              let steps = typeof fileContent === 'string' ? JSON.parse(fileContent) : fileContent;
              
              const res = await fetch('/api/tests/run', {
                  method: 'POST',
                  headers: {'Content-Type': 'application/json'},
                  body: JSON.stringify({ steps, data: row })
              });
              const json = await res.json();
              
              if (json.success && json.result.success) {
                  passedCount++;
                  const passMsg = `✔ Passed Row ${i+1}`;
                  totalLogs.push(passMsg);
                  setTerminalLogs(prev => [...prev, ...json.result.logs, passMsg]);
              } else {
                  const failMsg = `✖ Failed Row ${i+1}: ${json.error || 'Unknown error'}`;
                  totalLogs.push(failMsg);
                  setTerminalLogs(prev => [...prev, failMsg]);
              }
          }

          setTestResult({
              success: passedCount === rows.length,
              duration: 0,
              logs: [`Ran ${rows.length} iterations. ${passedCount} Passed.`, ...totalLogs]
          });
          setTerminalLogs(prev => [...prev, `Data Run Complete. Total Passed: ${passedCount}/${rows.length}`]);

      } catch (e: any) {
          setTerminalLogs(prev => [...prev, `Critical Error: ${e.message}`]);
          alert("Data Run Error: " + e.message);
      } finally {
          setIsRunning(false);
      }
  };

  const saveAiCode = async () => {
      const name = prompt('File Name (e.g. test_script.py):', 'generated_test.py');
      if (!name) return;

      const content = viewMode === 'python' ? aiPythonCode : aiSteps;
      
      await fetch('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: name, content }),
      });
      fetchFiles();
      loadFile(name);
      fetchFiles();
      loadFile(name);
  };

  const generateCI = async () => {
      try {
          const res = await fetch('/api/cicd', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify(ciConfig)
          });
          const json = await res.json();
          if (json.success) {
              setGeneratedYaml(json.yaml);
          } else {
              alert(json.error);
          }
      } catch (e) {
          alert("Failed to generate CI config");
      }
  };

  const saveCI = async () => {
      const name = '.github/workflows/playwright.yml';
      // We need to ensure the directory exists, but our simple file API might not handle deep paths well if not recursive.
      // For now, let's just save it as a file we can download or view. 
      // Actually, let's save it to the tests folder as a reference for now, or assume the user will copy it.
      // Better: Prompt for path.
      
      const path = prompt("Save CI Config to:", ".github/workflows/playwright.yml");
      if (!path) return;

      await fetch('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path, content: generatedYaml }),
      });
      alert('Saved!');
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans flex flex-col h-screen overflow-hidden">
        <div className="flex flex-1 overflow-hidden">
            <div className="flex-1 flex flex-col p-4 space-y-4 overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-600 rounded-lg shadow-lg shadow-blue-900/20">
              <Terminal className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                Automation Command Center
              </h1>
              <p className="text-neutral-400 text-sm">Unified interface for Playwright automation tasks</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
              <a 
                href="/manage"
                className="flex items-center space-x-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-sm text-neutral-300 border border-neutral-700 transition-all hover:border-purple-500 group"
              >
                  <Layout className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                  <span className="font-bold">Management Center</span>
              </a>
              <button 
                onClick={() => setShowAiSidebar(!showAiSidebar)}
                className={cn("p-2 rounded-lg border transition-all", showAiSidebar ? "bg-purple-600/20 border-purple-500 text-purple-400 shadow-lg shadow-purple-900/20" : "bg-neutral-800 border-neutral-700 text-neutral-500 hover:text-white")}
                title="Toggle AI Assistant"
              >
                  <Sparkles className="w-5 h-5" />
              </button>
              {!recording ? (
                  <>
                  <button 
                    onClick={startRecorder}
                    className="flex items-center space-x-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-sm text-neutral-300 border border-neutral-700 transition-all hover:border-blue-500"
                  >
                      <Video className="w-4 h-4 text-red-500" />
                      <span>Launch Recorder</span>
                  </button>
                  
                  <div className="flex bg-neutral-800 rounded p-1">
                      <button 
                          onClick={() => setRecorderLang('javascript')}
                          className={cn("px-2 py-1 text-xs rounded", recorderLang === 'javascript' ? "bg-neutral-700 text-white" : "text-neutral-500")}
                      >JS</button>
                      <button 
                          onClick={() => setRecorderLang('python')}
                          className={cn("px-2 py-1 text-xs rounded", recorderLang === 'python' ? "bg-neutral-700 text-white" : "text-neutral-500")}
                      >PY</button>
                  </div>
                  </>
              ) : (
                  <button 
                    onClick={stopRecorder}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm transition-all animate-pulse"
                  >
                      <StopCircle className="w-4 h-4" />
                      <span>Stop & Save Recording</span>
                  </button>
              )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
            
            {/* LEFT COLUMN: Tools (4 col) */}
            <div className="lg:col-span-4 space-y-6">
                
                {/* AI Copilot Card */}
                <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border border-indigo-800/50 rounded-xl p-6 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
                        <Sparkles className="w-12 h-12 text-purple-300" />
                    </div>
                    
                    <div className="flex items-center space-x-2 mb-4 relative z-10">
                        <Sparkles className="w-5 h-5 text-purple-400" />
                        <h2 className="font-semibold text-purple-100">AI Automation Copilot</h2>
                    </div>

                    <div className="space-y-3 relative z-10">
                        <textarea 
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            placeholder="e.g. Go to google.com and verify the title is Google"
                            className="w-full bg-black/30 border border-indigo-700/50 rounded-lg p-3 text-sm text-purple-100 placeholder-purple-300/50 outline-none focus:ring-1 focus:ring-purple-400 resize-none h-24"
                        />
                         <button
                            onClick={handleAiGenerate}
                            disabled={aiLoading || !aiPrompt}
                            className="w-full bg-purple-600 hover:bg-purple-500 text-white py-2 rounded-lg text-sm font-medium transition-all shadow-lg shadow-purple-900/20 active:scale-95 disabled:opacity-50"
                        >
                            {aiLoading ? (
                                <div className="flex items-center justify-center space-x-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Generating logic...</span>
                                </div>
                            ) : 'Generate Test Script'}
                        </button>
                    </div>
                </div>

                {/* Scraper Tool (Expanded) */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                            <Search className="w-5 h-5 text-emerald-500" />
                            <h2 className="font-semibold">Web Scraper & Inspector</h2>
                        </div>
                        
                        {/* Headless Toggle */}
                        <button 
                            onClick={() => setHeadless(!headless)}
                            className="flex items-center space-x-2 text-xs bg-neutral-950 px-2 py-1 rounded border border-neutral-800 hover:border-neutral-600"
                            title={headless ? "Browser is hidden (Fast)" : "Browser is visible (Debug)"}
                        >
                            {headless ? <EyeOff className="w-3 h-3 text-neutral-500"/> : <Eye className="w-3 h-3 text-blue-400"/>}
                            <span>{headless ? 'Headless' : 'Visible'}</span>
                        </button>
                    </div>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-medium text-neutral-500 mb-1 block">Target URL</label>
                            <input
                                type="text"
                                placeholder="https://example.com"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-sm focus:ring-1 focus:ring-emerald-500 outline-none"
                            />
                        </div>
                         
                        <div>
                            <label className="text-xs font-medium text-neutral-500 mb-1 block">CSS Selector (Optional)</label>
                            <input
                                type="text"
                                placeholder="e.g. .price"
                                value={selector}
                                onChange={(e) => setSelector(e.target.value)}
                                className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-sm focus:ring-1 focus:ring-emerald-500 outline-none"
                            />
                        </div>

                        {/* Authentication Toggle */}
                        <div className="border border-neutral-800 rounded bg-neutral-950/50">
                            <button 
                                onClick={() => setShowLogin(!showLogin)}
                                className="w-full flex items-center justify-between p-2 text-xs text-neutral-400 hover:text-neutral-200"
                            >
                                <div className="flex items-center space-x-2">
                                    <Lock className="w-3 h-3" />
                                    <span>Authentication Required?</span>
                                </div>
                                {showLogin ? <ChevronUp className="w-3 h-3"/> : <ChevronDown className="w-3 h-3"/>}
                            </button>
                            
                            {showLogin && (
                                <div className="p-2 space-y-2 border-t border-neutral-800">
                                    <label className="flex items-center space-x-2 text-xs text-neutral-400 cursor-pointer select-none">
                                        <input 
                                            type="checkbox" 
                                            checked={loginConfig.enabled}
                                            onChange={(e) => setLoginConfig({...loginConfig, enabled: e.target.checked})}
                                            className="rounded border-neutral-700 bg-neutral-900 text-emerald-500 focus:ring-0"
                                        />
                                        <span>Enable Login Flow</span>
                                    </label>
                                    
                                    {loginConfig.enabled && (
                                        <div className="space-y-2 pt-2 animate-in slide-in-from-top-2">
                                            <input
                                                type="text"
                                                placeholder="Username / Email"
                                                value={loginConfig.username}
                                                onChange={(e) => setLoginConfig({...loginConfig, username: e.target.value})}
                                                className="w-full bg-neutral-900 border border-neutral-800 rounded p-2 text-xs outline-none focus:border-emerald-500"
                                            />
                                            <input
                                                type="password"
                                                placeholder="Password"
                                                value={loginConfig.password}
                                                onChange={(e) => setLoginConfig({...loginConfig, password: e.target.value})}
                                                className="w-full bg-neutral-900 border border-neutral-800 rounded p-2 text-xs outline-none focus:border-emerald-500"
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleScrape}
                            disabled={loading || !url}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-lg text-sm font-medium transition-all shadow-lg shadow-emerald-900/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center space-x-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Processing...</span>
                                </div>
                            ) : 'Scrape URL'}
                        </button>
                    </div>
                </div>

                {/* Explorer Tabs */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-xl flex-1 flex flex-col overflow-hidden h-[400px]">
                    <div className="flex border-b border-neutral-800">
                        <button 
                            className={cn("flex-1 py-3 text-sm font-medium", activeTab === 'tests' ? "bg-neutral-800 text-white" : "text-neutral-500 hover:text-neutral-300")}
                            onClick={() => setActiveTab('tests')}
                        >
                            Test Scripts
                        </button>
                        <button 
                            className={cn("flex-1 py-3 text-sm font-medium", activeTab === 'pom' ? "bg-neutral-800 text-white" : "text-neutral-500 hover:text-neutral-300")}
                            onClick={() => setActiveTab('pom')}
                        >
                            Page Objects
                        </button>
                        <button 
                            className={cn("flex-1 py-3 text-[10px] font-bold uppercase tracking-wider transition-all", activeTab === 'reports' ? "bg-neutral-800 text-emerald-400 shadow-inner" : "text-neutral-500 hover:text-neutral-300")}
                            onClick={() => { setActiveTab('reports'); fetchReports(); }}
                        >
                            Analytics
                        </button>
                        <button 
                            className={cn("flex-1 py-3 text-[10px] font-bold uppercase tracking-wider transition-all", activeTab === 'scheduling' ? "bg-neutral-800 text-blue-400 shadow-inner" : "text-neutral-500 hover:text-neutral-300")}
                            onClick={() => { setActiveTab('scheduling'); fetchJobs(); }}
                        >
                            History
                        </button>
                        <button 
                            className={cn("flex-1 py-3 text-[10px] font-bold uppercase tracking-wider transition-all", activeTab === 'cicd' ? "bg-neutral-800 text-purple-400 shadow-inner" : "text-neutral-500 hover:text-neutral-300")}
                            onClick={() => setActiveTab('cicd')}
                        >
                            CI/CD
                        </button>
                        <button 
                            className={cn("flex-1 py-3 text-[10px] font-bold uppercase tracking-wider transition-all", activeTab === 'bdd' ? "bg-neutral-800 text-purple-400 shadow-inner" : "text-neutral-500 hover:text-neutral-300")}
                            onClick={() => setActiveTab('bdd')}
                        >
                            BDD
                        </button>
                        <button 
                            className={cn("flex-1 py-3 text-[10px] font-bold uppercase tracking-wider transition-all", activeTab === 'suites' ? "bg-neutral-800 text-yellow-400 shadow-inner" : "text-neutral-500 hover:text-neutral-300")}
                            onClick={() => { setActiveTab('suites'); fetchSuites(); }}
                        >
                            Suites
                        </button>
                    </div>

                    <div className="p-4 flex-1 overflow-y-auto">
                        {activeTab === 'tests' ? (
                            <div className="space-y-1">
                                <div className="flex justify-between items-center mb-2 px-2">
                                    <span className="text-xs text-neutral-500 font-bold uppercase">Files</span>
                                    <div className="flex space-x-1">
                                         <button onClick={createJob} className="p-1 hover:bg-neutral-800 rounded text-neutral-400" title="Schedule Selected File"><Clock className="w-3 h-3"/></button>
                                         <button onClick={createNewFile} className="p-1 hover:bg-neutral-800 rounded"><Plus className="w-3 h-3"/></button>
                                    </div>
                                </div>
                                {files.map(file => (
                                    <button
                                        key={file.path}
                                        onClick={() => loadFile(file.path)}
                                        className={cn(
                                            "w-full text-left px-3 py-2 rounded text-sm flex items-center justify-between group transition-colors",
                                            selectedFile?.path === file.path ? "bg-blue-900/30 text-blue-200 border border-blue-900" : "hover:bg-neutral-800 text-neutral-400 border border-transparent"
                                        )}
                                    >
                                        <div className="flex items-center space-x-2">
                                            <FileCode className="w-4 h-4" />
                                            <span className="truncate">{file.name}</span>
                                        </div>
                                        {selectedFile?.path === file.path && (
                                            <div 
                                                onClick={(e) => { e.stopPropagation(); runCommand(); }}
                                                className="p-1 hover:bg-blue-500 rounded-full text-blue-400 hover:text-white cursor-pointer"
                                            >
                                                <Play className="w-3 h-3 fill-current" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        ) : activeTab === 'pom' ? (
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between items-center mb-2 px-2">
                                        <span className="text-xs text-neutral-500 font-bold uppercase">Pages</span>
                                        <button onClick={createNewPage} className="p-1 hover:bg-neutral-800 rounded"><Plus className="w-3 h-3"/></button>
                                    </div>
                                    <div className="space-y-1">
                                        {pages.map(page => (
                                            <button
                                                key={page.id}
                                                onClick={() => { setSelectedPage(page); fetchSelectors(page.id); }}
                                                className={cn(
                                                    "w-full text-left px-3 py-2 rounded text-sm flex items-center space-x-2 transition-colors",
                                                    selectedPage?.id === page.id ? "bg-emerald-900/30 text-emerald-200 border border-emerald-900" : "hover:bg-neutral-800 text-neutral-400 border border-transparent"
                                                )}
                                            >
                                                <LayoutTemplate className="w-4 h-4" />
                                                <span className="truncate">{page.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {selectedPage && (
                                    <div className="pt-4 border-t border-neutral-800 animate-in slide-in-from-right-4">
                                        <div className="flex justify-between items-center mb-2 px-2">
                                            <span className="text-xs text-neutral-500 font-bold uppercase">{selectedPage.name} Selectors</span>
                                            <button onClick={addSelector} className="p-1 hover:bg-neutral-800 rounded"><Plus className="w-3 h-3"/></button>
                                        </div>
                                        <div className="space-y-1">
                                            {selectors.map(sel => (
                                                <div key={sel.id} className="px-3 py-2 bg-neutral-900 border border-neutral-800 rounded text-xs text-neutral-300 flex justify-between items-center group hover:border-neutral-600">
                                                    <span className="font-mono">{sel.name}</span>
                                                    <span className="text-neutral-500">{sel.selector}</span>
                                                </div>
                                            ))}
                                            {selectors.length === 0 && <p className="text-xs text-neutral-600 italic px-2">No selectors yet.</p>}
                                        </div>
                                        
                                        <div className="pt-4 border-t border-neutral-800 mt-4">
                                            <div className="flex justify-between items-center mb-2 px-2">
                                                <span className="text-xs text-neutral-500 font-bold uppercase">{selectedPage.name} Test Cases</span>
                                                <button onClick={addPageTest} className="p-1 hover:bg-neutral-800 rounded"><Plus className="w-3 h-3"/></button>
                                            </div>
                                            <div className="space-y-1">
                                                {pageTests.map(test => (
                                                    <div key={test.id} className="px-3 py-2 bg-neutral-900 border border-neutral-800 rounded text-xs text-neutral-300 flex justify-between items-center group hover:border-neutral-600">
                                                        <span className="font-mono">{test.name}</span>
                                                        <button onClick={() => runPageTest(test)} className="text-emerald-500 hover:text-emerald-400"><Play className="w-3 h-3"/></button>
                                                    </div>
                                                ))}
                                                {pageTests.length === 0 && <p className="text-xs text-neutral-600 italic px-2">No tests yet.</p>}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : activeTab === 'reports' ? (
                            <div className="space-y-6">
                                <AnalyticsDashboard stats={stats} history={runHistory} />
                                
                                <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl shadow-xl">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center space-x-2">
                                            <Eye className="w-5 h-5 text-blue-500" />
                                            <h4 className="text-sm font-bold text-neutral-300">Visual Regression Comparison</h4>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <select 
                                                className="bg-neutral-800 text-[10px] text-neutral-400 rounded border border-neutral-700 px-2 py-1 outline-none"
                                                value={selectedSnapshot}
                                                onChange={(e) => { loadSnapshotData(e.target.value); fetchSnapshots(); }}
                                                onClick={() => { if (snapshots.length === 0) fetchSnapshots(); }}
                                            >
                                                <option value="">Select Snapshot</option>
                                                {snapshots.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                            <button onClick={fetchSnapshots} className="p-1 hover:bg-neutral-800 rounded text-neutral-500"><RefreshCw className="w-3 h-3"/></button>
                                        </div>
                                    </div>
                                    <VisualComparisonSlider 
                                        baseline={visualImages.baseline} 
                                        actual={visualImages.actual} 
                                        diff={visualImages.diff} 
                                    />
                                </div>
                            </div>
                        ) : activeTab === 'scheduling' ? (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center mb-2 px-2">
                                    <span className="text-xs text-neutral-500 font-bold uppercase">Scheduled Jobs</span>
                                    <button onClick={createJob} className="p-1 hover:bg-neutral-800 rounded text-neutral-400" title="Schedule New Job">
                                        <Plus className="w-3 h-3"/>
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {jobs.map(job => (
                                        <div key={job.id} className="p-3 bg-neutral-800/50 border border-neutral-800 rounded-lg flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <span className="text-sm text-neutral-200 font-medium">{job.test_name}</span>
                                                <span className="text-[10px] text-neutral-500 font-mono">{job.cron_schedule}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <div className={cn("w-1.5 h-1.5 rounded-full", job.active ? "bg-emerald-500" : "bg-neutral-600")} />
                                                <button onClick={() => deleteJob(job.id)} className="text-neutral-500 hover:text-red-400 p-1">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {jobs.length === 0 && <p className="text-xs text-neutral-600 italic px-2">No scheduled jobs.</p>}
                                </div>
                            </div>
                        ) : activeTab === 'cicd' ? (
                            <div className="space-y-4">
                                <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-4">
                                    <h4 className="text-xs font-bold text-neutral-500 uppercase">Generate CI Workflow</h4>
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-neutral-500">Provider</label>
                                        <select 
                                            className="w-full bg-neutral-900 border border-neutral-800 rounded p-2 text-xs outline-none"
                                            value={ciConfig.provider}
                                            onChange={(e) => setCiConfig({...ciConfig, provider: e.target.value})}
                                        >
                                            <option value="github">GitHub Actions</option>
                                            <option value="gitlab">GitLab CI</option>
                                        </select>
                                    </div>
                                    <button 
                                        onClick={generateCI}
                                        className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-bold transition-all shadow-lg shadow-purple-900/20"
                                    >
                                        Generate Workflow
                                    </button>
                                </div>
                            </div>
                        ) : null}

                        {activeTab === 'bdd' && (
                            <div className="space-y-6">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <h3 className="text-lg font-medium text-white flex items-center space-x-2">
                                        <Sparkles className="w-5 h-5 text-purple-400" />
                                        <span>Behavior Driven Testing (BDD)</span>
                                    </h3>
                                    
                                    <div className="flex items-center space-x-3">
                                        <div className="flex items-center space-x-2 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 focus-within:border-purple-500/50 transition-all">
                                            <Search className="w-3.5 h-3.5 text-neutral-500" />
                                            <input 
                                                type="text"
                                                placeholder="Filter by tags (e.g. @smoke)"
                                                value={bddTags}
                                                onChange={(e) => setBddTags(e.target.value)}
                                                className="bg-transparent text-xs text-neutral-300 outline-none w-40 placeholder:text-neutral-700 font-mono"
                                            />
                                        </div>
                                        <button 
                                            onClick={runBdd}
                                            disabled={isRunning}
                                            className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl text-sm font-bold shadow-xl shadow-purple-900/20 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
                                        >
                                            {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                                            <span>{bddTags ? `Run ${bddTags}` : 'Execute All Features'}</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {bddFeatures.map(f => (
                                        <div key={f} className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl flex items-center justify-between hover:border-purple-500/30 transition-all cursor-pointer group">
                                            <div className="flex items-center space-x-3">
                                                <div className="p-2 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-colors">
                                                    <FileText className="w-4 h-4 text-purple-400" />
                                                </div>
                                                <span className="text-sm text-neutral-300">{f}</span>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-neutral-600 group-hover:text-purple-400 transition-all group-hover:translate-x-1" />
                                        </div>
                                    ))}
                                </div>

                                {bddResult && (
                                    <div className="mt-6 animate-in zoom-in-95 duration-300">
                                        <div className="flex items-center space-x-2 mb-3">
                                            <div className={cn("w-2 h-2 rounded-full", bddResult.success ? "bg-emerald-500" : "bg-red-500")} />
                                            <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Last Run Result</h4>
                                        </div>
                                        <pre className="p-6 bg-black border border-neutral-800 rounded-2xl text-[11px] font-mono text-emerald-400 overflow-auto whitespace-pre h-[400px] shadow-2xl">
                                            {bddResult.output}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'suites' && (
                            <div className="space-y-4 p-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-bold text-neutral-400 text-xs uppercase">Test Suites (Tags)</h3>
                                    <div className="flex space-x-2">
                                        <div className="flex items-center space-x-1 bg-neutral-800 px-2 py-1 rounded border border-neutral-700">
                                            <span className="text-[10px] text-neutral-500">Concurrency:</span>
                                            <input 
                                                type="number" 
                                                value={concurrency} 
                                                onChange={(e) => setConcurrency(parseInt(e.target.value))}
                                                min={1} 
                                                max={5} 
                                                className="w-8 bg-transparent text-[10px] text-emerald-400 focus:outline-none" 
                                            />
                                        </div>
                                        {isRunning && (
                                            <button 
                                                onClick={stopTest}
                                                className="flex items-center space-x-1 px-2 py-1 bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded text-xs transition-colors border border-red-600/50"
                                            >
                                                <Square className="w-3 h-3 fill-current" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {suiteResult && (
                                    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 space-y-2 animate-in fade-in zoom-in-95">
                                        <div className="flex items-center justify-between border-b border-neutral-800 pb-2 mb-2">
                                            <div className="flex items-center space-x-2">
                                                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Results: {suiteResult.tag}</h4>
                                                <span className={cn("text-[10px] px-1.5 py-0.5 rounded", suiteResult.summary.failed === 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500")}>
                                                    {suiteResult.summary.passed}/{suiteResult.summary.total} Passed
                                                </span>
                                            </div>
                                            <button onClick={() => setSuiteResult(null)} className="text-neutral-500 hover:text-neutral-300 text-[10px]">Clear</button>
                                        </div>
                                        <div className="max-h-32 overflow-y-auto space-y-1 pr-1">
                                            {suiteResult.results.map((r: any, idx: number) => (
                                                <div key={idx} className="flex items-center justify-between text-[10px] bg-neutral-950/50 p-1.5 rounded border border-neutral-800/50">
                                                    <div className="flex items-center space-x-2 truncate">
                                                        <div className={cn("w-1.5 h-1.5 rounded-full", r.success ? "bg-emerald-500" : "bg-red-500")} />
                                                        <span className="text-neutral-300 truncate">{r.name}</span>
                                                    </div>
                                                    {r.duration && <span className="text-neutral-600 ml-2 whitespace-nowrap">{r.duration}ms</span>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    {Object.entries(suites).map(([tag, tests]) => (
                                        <div key={tag} className="p-3 bg-neutral-800/30 border border-neutral-800 rounded-lg group hover:border-emerald-500/50 transition-all">
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center space-x-2">
                                                    <div className={cn("w-2 h-2 rounded-full shadow-lg", 
                                                        tag === 'smoke' ? "bg-emerald-500 shadow-emerald-500/30" : 
                                                        tag === 'regression' ? "bg-purple-500 shadow-purple-500/30" : 
                                                        "bg-neutral-500"
                                                    )} />
                                                    <span className="text-sm font-medium text-neutral-200 capitalize">{tag}</span>
                                                </div>
                                                <button 
                                                    onClick={() => runSuite(tag)}
                                                    disabled={isRunning}
                                                    className="text-emerald-500 hover:text-emerald-400 p-1 hover:bg-emerald-500/10 rounded transition-colors disabled:opacity-50"
                                                    title={`Run ${tag} suite`}
                                                >
                                                    {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                                                </button>
                                            </div>
                                            <p className="text-[10px] text-neutral-500 mt-1">{tests.length} tests tagged with @{tag}</p>
                                            <div className="mt-2 space-y-1 hidden group-hover:block">
                                                {tests.map(t => (
                                                    <div key={t.path} className="text-[9px] text-neutral-400 flex items-center space-x-1">
                                                        <FileCode className="w-2.5 h-2.5 opacity-50" />
                                                        <span>{t.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                    {Object.keys(suites).length === 0 && (
                                        <p className="text-xs text-neutral-600 italic px-2">No tags detected in test files.</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN: Results & Editor (8 col) */}
            <div className="lg:col-span-8 space-y-6">

                 {/* Scraper Output (if active) */}
                 {(scrapeData || error || loading || recordedCode || aiSteps) && (
                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-xl animate-in fade-in slide-in-from-top-4">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-medium text-white">Results</h3>
                                {recordedCode && <p className="text-xs text-neutral-500">Recorded Playwright Code</p>}
                                {aiSteps && <p className="text-xs text-purple-400">AI Generated Steps</p>}
                                {scrapeData && <p className="text-xs text-neutral-500">Data extracted from target URL</p>}
                            </div>
                            {(scrapeData || aiSteps) && (
                                <div className="flex space-x-2">
                                    <button 
                                        onClick={saveAiCode}
                                        className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium"
                                    >
                                        <Save className="w-3 h-3" />
                                        <span>Save {viewMode === 'python' ? '.py' : '.json'}</span>
                                    </button>
                                </div>
                            )}
                        </div>
                        
                        {loading ? (
                             <div className="h-40 flex flex-col items-center justify-center text-neutral-500 space-y-2">
                                 <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                                 <p className="text-sm">Browser is running actions...</p>
                                 {!headless && <p className="text-xs text-neutral-600">(Check the open browser window)</p>}
                             </div>
                        ) : (
                            <div className="relative">
                                {(aiSteps || aiPythonCode || aiRawResponse) && (
                <div className="absolute top-2 right-2 flex space-x-2">
                    <div className="bg-neutral-800 rounded p-1 flex text-xs">
                        <button 
                            onClick={() => setViewMode('json')}
                            className={cn("px-2 py-1 rounded", viewMode === 'json' ? "bg-neutral-700 text-white" : "text-neutral-400 hover:text-neutral-300")}
                        >
                            JSON
                        </button>
                        <button 
                            onClick={() => setViewMode('python')}
                            className={cn("px-2 py-1 rounded", viewMode === 'python' ? "bg-neutral-700 text-white" : "text-neutral-400 hover:text-neutral-300")}
                        >
                            Python
                        </button>
                        <button 
                            onClick={() => setViewMode('raw')}
                            className={cn("px-2 py-1 rounded", viewMode === 'raw' ? "bg-neutral-700 text-white" : "text-neutral-400 hover:text-neutral-300")}
                        >
                            Raw
                        </button>
                    </div>
                </div>
            )}

            <pre className="text-xs font-mono text-emerald-300 bg-black p-4 rounded-lg overflow-auto max-h-60 border border-neutral-800">
                {error ? <span className="text-red-400">{error}</span> : 
                 recordedCode ? recordedCode :
                 (aiSteps || aiPythonCode || aiRawResponse) ? (
                     viewMode === 'raw' ? aiRawResponse :
                     viewMode === 'python' ? aiPythonCode : 
                     JSON.stringify(aiSteps, null, 2)
                 ) : 
                 scrapeData ? JSON.stringify(scrapeData, null, 2) : 
                 'Ready...'}
            </pre>
                            </div>
                        )}
                    </div>
                )}
                
                {/* Editor & Terminal Section */}
                {selectedFile ? (
                    <div className="flex flex-col space-y-4">
                        {selectedFile.path.endsWith('.json') && (
                            <NoCodeStepBuilder 
                                steps={(() => {
                                    try { return JSON.parse(fileContent); } catch(e) { return []; }
                                })()} 
                                onStepsChange={(newSteps) => setFileContent(JSON.stringify(newSteps, null, 2))} 
                            />
                        )}

                        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-xl flex flex-col">
                            {/* Editor Header */}
                            <div className="px-4 py-3 border-b border-neutral-800 flex justify-between items-center bg-neutral-900/50">
                                <div className="flex items-center space-x-2">
                                    <FileCode className="w-4 h-4 text-emerald-400" />
                                    <span className="font-mono text-xs text-neutral-300 truncate max-w-[200px]">{selectedFile.name}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <select 
                                        className="bg-neutral-800 text-[10px] text-neutral-400 rounded border border-neutral-700 px-2 py-1 outline-none focus:border-blue-500/50 transition-colors"
                                        value={selectedDataFile}
                                        onChange={(e) => loadDataContent(e.target.value)}
                                    >
                                        <option value="">No Data</option>
                                        {dataFiles.map(f => <option key={f.path} value={f.path}>{f.name}</option>)}
                                    </select>
                                    
                                    <div className="h-4 w-[1px] bg-neutral-800 mx-1"></div>

                                    <button 
                                        onClick={saveFile}
                                        className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-all"
                                        title="Save Script"
                                    >
                                        <Save className="w-4 h-4" />
                                    </button>

                                    <button 
                                        onClick={selectedDataFile ? runWithData : runTest}
                                        disabled={isRunning}
                                        className={cn("flex items-center space-x-1.5 px-4 py-1.5 rounded text-xs font-bold transition-all shadow-lg", 
                                            selectedDataFile ? "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20" : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20"
                                        )}
                                    >
                                        {isRunning ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <Rocket className="w-3.5 h-3.5" />}
                                        <span>{selectedDataFile ? 'Run Data Suite' : 'Run Script'}</span>
                                    </button>

                                    {isRunning && (
                                        <button 
                                            onClick={stopTest}
                                            className="flex items-center space-x-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-bold shadow-lg shadow-red-900/20"
                                        >
                                            <Square className="w-3 h-3 fill-current" />
                                            <span>Stop</span>
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Data Preview (Inline) */}
                            {selectedDataFile && dataColumns.length > 0 && (
                                <div className="px-4 py-2 bg-blue-900/5 border-b border-neutral-800 animate-in slide-in-from-top-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center space-x-2">
                                            <Database className="w-3 h-3 text-blue-400" />
                                            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-tight">Active Data Source</span>
                                        </div>
                                        <div className="flex gap-1">
                                            {dataColumns.slice(0, 3).map(col => (
                                                <span key={col} className="px-1.5 py-0.5 bg-blue-900/20 text-blue-400 border border-blue-900/30 rounded text-[9px]">
                                                    {col}
                                                </span>
                                            ))}
                                            {dataColumns.length > 3 && <span className="text-[9px] text-neutral-600">+{dataColumns.length - 3} more</span>}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Script Editor (Monaco) */}
                            <div className="h-[450px] relative group">
                                <Editor
                                    height="100%"
                                    theme="automation-dark"
                                    beforeMount={(monaco) => {
                                        monaco.editor.defineTheme('automation-dark', {
                                            base: 'vs-dark',
                                            inherit: true,
                                            rules: [],
                                            colors: {
                                                'editor.background': '#0a0a0a',
                                                'editorGutter.background': '#0a0a0a',
                                            },
                                        });
                                    }}
                                    language={selectedFile?.path.endsWith('.py') ? 'python' : (selectedFile?.path.endsWith('.ts') ? 'typescript' : 'json')}
                                    value={fileContent}
                                    onChange={(value) => setFileContent(value || '')}
                                    options={{
                                        minimap: { enabled: false },
                                        fontSize: 13,
                                        lineNumbers: 'on',
                                        roundedSelection: true,
                                        scrollBeyondLastLine: false,
                                        readOnly: isRunning,
                                        automaticLayout: true,
                                        fontFamily: 'JetBrains Mono, Menlo, Monaco, Courier New, monospace',
                                        padding: { top: 16, bottom: 16 },
                                    }}
                                />
                                {isRunning && (
                                    <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] flex items-center justify-center z-20">
                                        <div className="bg-neutral-900/80 border border-neutral-800 rounded-full px-4 py-2 flex items-center space-x-2 shadow-2xl">
                                            <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                                            <span className="text-xs font-medium text-neutral-300">Execution in progress...</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Results / Terminal Output */}
                        <TerminalWindow 
                            logs={terminalLogs} 
                            onClear={() => setTerminalLogs([])} 
                        />
                    </div>
                ) : (
                    <div className="h-[500px] bg-neutral-900/30 border border-neutral-800 border-dashed rounded-2xl flex flex-col items-center justify-center text-neutral-500 space-y-4">
                        <div className="p-4 bg-neutral-900 rounded-2xl border border-neutral-800 shadow-xl">
                            <FileCode className="w-12 h-12 opacity-20 text-emerald-500" />
                        </div>
                        <div className="text-center">
                            <h3 className="text-white font-medium">No Script Selected</h3>
                            <p className="text-sm text-neutral-600 mt-1">Select a test from the explorer to begin editing.</p>
                        </div>
                    </div>
                )}
            </div>
            {showAiSidebar && (
                <AiAssistantSidebar 
                    onSuggestion={(steps) => {
                        if (selectedFile?.path.endsWith('.json')) {
                            setFileContent(JSON.stringify(steps, null, 2));
                        } else {
                            setAiSteps(steps);
                            setViewMode('json');
                        }
                    }} 
                />
            )}
        </div>
    </div>
</div>
</div>
  );
}
