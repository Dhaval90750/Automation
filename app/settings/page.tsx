'use client';

import { useState, useEffect } from 'react';
import { Save, Key, Clock, Palette, Monitor, Layout, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
    const [settings, setSettings] = useState({
        geminiApiKey: '',
        defaultTimeout: 30000,
        headlessMode: false,
        theme: 'dark',
        maxConcurrency: 3,
        retries: 0
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/settings');
            const json = await res.json();
            if (json.success) {
                setSettings(prev => ({ ...prev, ...json.settings }));
            }
        } catch (e) {
            console.error("Failed to load settings", e);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });
            alert('Settings Saved Successfully!');
        } catch (e) {
            alert('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-neutral-100 font-sans selection:bg-purple-500/30 p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <header className="flex items-center justify-between border-b border-neutral-800 pb-6">
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-white mb-2">Global Settings</h1>
                        <p className="text-neutral-500 text-sm">Configure environment, keys, and execution defaults.</p>
                    </div>
                    <Link href="/" className="px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-sm font-bold text-neutral-400 hover:text-white hover:border-neutral-700 transition-all flex items-center space-x-2">
                        <Layout className="w-4 h-4" />
                        <span>Back to Home</span>
                    </Link>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* API Keys Section */}
                    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-6">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="p-2 bg-purple-600/20 rounded-lg text-purple-500"><Key className="w-5 h-5"/></div>
                            <h3 className="text-lg font-bold text-white">API Integrations</h3>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-neutral-500 uppercase">Gemini API Key (AI)</label>
                                <input 
                                    type="password"
                                    value={settings.geminiApiKey}
                                    onChange={(e) => setSettings({...settings, geminiApiKey: e.target.value})}
                                    placeholder="sk-..."
                                    className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-sm text-white focus:border-purple-500 outline-none transition-all placeholder:text-neutral-800"
                                />
                                <p className="text-[10px] text-neutral-600">Required for AI generation features.</p>
                            </div>
                        </div>
                    </div>

                    {/* Execution Defaults */}
                    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-6">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="p-2 bg-blue-600/20 rounded-lg text-blue-500"><Monitor className="w-5 h-5"/></div>
                            <h3 className="text-lg font-bold text-white">Execution Defaults</h3>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-neutral-500 uppercase">Default Timeout (ms)</label>
                                <div className="flex items-center space-x-2">
                                    <Clock className="w-4 h-4 text-neutral-600" />
                                    <input 
                                        type="number"
                                        value={settings.defaultTimeout}
                                        onChange={(e) => setSettings({...settings, defaultTimeout: parseInt(e.target.value)})}
                                        className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-sm text-white focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-black border border-neutral-800 rounded-xl">
                                <div className="space-y-1">
                                    <span className="text-xs font-bold text-neutral-300 block">Headless Mode</span>
                                    <span className="text-[10px] text-neutral-600 block">Run browsers without UI</span>
                                </div>
                                <button 
                                    onClick={() => setSettings({...settings, headlessMode: !settings.headlessMode})}
                                    className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.headlessMode ? 'bg-blue-600' : 'bg-neutral-800'}`}
                                >
                                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${settings.headlessMode ? 'translate-x-6' : 'translate-x-0'}`} />
                                </button>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-neutral-500 uppercase">Max Concurrency</label>
                                <input 
                                    type="number"
                                    max={10} min={1}
                                    value={settings.maxConcurrency}
                                    onChange={(e) => setSettings({...settings, maxConcurrency: parseInt(e.target.value)})}
                                    className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-sm text-white focus:border-blue-500 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Reliability */}
                    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-6">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="p-2 bg-emerald-600/20 rounded-lg text-emerald-500"><ShieldAlert className="w-5 h-5"/></div>
                            <h3 className="text-lg font-bold text-white">Reliability</h3>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-neutral-500 uppercase">Auto-Retries (on failure)</label>
                                <select 
                                    value={settings.retries}
                                    onChange={(e) => setSettings({...settings, retries: parseInt(e.target.value)})}
                                    className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-sm text-white focus:border-emerald-500 outline-none transition-all"
                                >
                                    <option value={0}>Disabled</option>
                                    <option value={1}>1 Retry</option>
                                    <option value={2}>2 Retries</option>
                                    <option value={3}>3 Retries</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-neutral-800">
                    <button 
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center space-x-2 px-8 py-3 bg-white text-black hover:bg-neutral-200 rounded-xl font-bold shadow-lg shadow-white/10 transition-all disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" />
                        <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
