
import Link from 'next/link';
import { Terminal, Workflow, Layout, ArrowRight, Zap, Database, BarChart3, ShieldCheck } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-neutral-950 to-neutral-950 -z-10" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[100px] -z-10" />

      <div className="max-w-6xl w-full space-y-12">
        {/* Header */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center space-x-2 bg-neutral-900/50 border border-neutral-800 px-4 py-1.5 rounded-full backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-700">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">System Operational v3.0</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-neutral-500 animate-in fade-in slide-in-from-bottom-4 duration-700">
            Automation Command Center
          </h1>
          <p className="text-lg text-neutral-400 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            Unified control plane for orchestration, execution, and management of automated testing workflows.
          </p>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-200">
          
          {/* Module 1: Command Center */}
          <Link href="/command" className="group relative bg-neutral-900/40 border border-neutral-800 rounded-3xl p-8 hover:bg-neutral-900/60 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-900/20 flex flex-col justify-between h-[320px]">
            <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
            
            <div className="relative z-10 space-y-6">
              <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center border border-purple-500/20 group-hover:border-purple-500/50 transition-colors">
                <Terminal className="w-7 h-7 text-purple-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">Runner & Scraper</h2>
                <p className="text-sm text-neutral-500 leading-relaxed">
                  Interactive test runner, web scraper, and DOM inspector. detailed execution logs and visual debugging.
                </p>
              </div>
            </div>

            <div className="relative z-10 flex items-center text-sm font-bold text-purple-400 group-hover:translate-x-1 transition-transform">
              <span>Launch Console</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </div>
          </Link>

          {/* Module 2: Workflow Orchestrator */}
          <Link href="/workflows" className="group relative bg-neutral-900/40 border border-neutral-800 rounded-3xl p-8 hover:bg-neutral-900/60 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-pink-900/20 flex flex-col justify-between h-[320px]">
             <div className="absolute inset-0 bg-gradient-to-b from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
            
            <div className="relative z-10 space-y-6">
              <div className="w-14 h-14 bg-pink-500/10 rounded-2xl flex items-center justify-center border border-pink-500/20 group-hover:border-pink-500/50 transition-colors">
                <Workflow className="w-7 h-7 text-pink-400" />
              </div>
              <div className="flex items-center space-x-2 mb-2">
                 <h2 className="text-2xl font-bold text-white group-hover:text-pink-400 transition-colors">Orchestrator</h2>
                 <span className="bg-pink-500/20 text-pink-300 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border border-pink-500/30">AI Powered</span>
              </div>
              
              <p className="text-sm text-neutral-500 leading-relaxed">
                Design complex automation flows with a visual node-based builder. 
                Generate workflows from natural language using Gemini AI.
              </p>
            </div>

            <div className="relative z-10 flex items-center text-sm font-bold text-pink-400 group-hover:translate-x-1 transition-transform">
              <span>Open Builder</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </div>
          </Link>

          {/* Module 3: Management Center */}
          <Link href="/manage" className="group relative bg-neutral-900/40 border border-neutral-800 rounded-3xl p-8 hover:bg-neutral-900/60 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-emerald-900/20 flex flex-col justify-between h-[320px]">
             <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
            
            <div className="relative z-10 space-y-6">
              <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 group-hover:border-emerald-500/50 transition-colors">
                <Layout className="w-7 h-7 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">Management</h2>
                <p className="text-sm text-neutral-500 leading-relaxed">
                  Centralized repository for Test Scripts, Page Objects, Data Sources, and Execution History.
                </p>
              </div>
            </div>

            <div className="relative z-10 flex items-center text-sm font-bold text-emerald-400 group-hover:translate-x-1 transition-transform">
              <span>Manage Assets</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </div>
          </Link>
        </div>

        {/* Stats / Footer Mockup */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12 border-t border-neutral-900 opacity-50">
           <div className="flex items-center space-x-3">
              <Zap className="w-5 h-5 text-yellow-500" />
              <div>
                 <div className="text-xs font-bold text-neutral-500 uppercase">Active Nodes</div>
                 <div className="text-lg font-mono text-neutral-300">12</div>
              </div>
           </div>
           <div className="flex items-center space-x-3">
              <Database className="w-5 h-5 text-blue-500" />
              <div>
                 <div className="text-xs font-bold text-neutral-500 uppercase">Data Points</div>
                 <div className="text-lg font-mono text-neutral-300">8.4k</div>
              </div>
           </div>
           <div className="flex items-center space-x-3">
              <BarChart3 className="w-5 h-5 text-purple-500" />
              <div>
                 <div className="text-xs font-bold text-neutral-500 uppercase">Executions (24h)</div>
                 <div className="text-lg font-mono text-neutral-300">142</div>
              </div>
           </div>
           <div className="flex items-center space-x-3">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <div>
                 <div className="text-xs font-bold text-neutral-500 uppercase">System Status</div>
                 <div className="text-lg font-mono text-emerald-400">Stable</div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
