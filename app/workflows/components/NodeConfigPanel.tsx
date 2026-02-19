
import { useState, useEffect } from 'react';
import { X, Save, Trash2 } from 'lucide-react';
import { Node } from '@xyflow/react';

interface NodeConfigPanelProps {
    selectedNode: Node | null;
    onClose: () => void;
    onUpdate: (id: string, data: any) => void;
    onDelete: (id: string) => void;
    testCases: any[];
}

export default function NodeConfigPanel({ selectedNode, onClose, onUpdate, onDelete, testCases }: NodeConfigPanelProps) {
    const [formData, setFormData] = useState<any>({});

    useEffect(() => {
        if (selectedNode) {
            setFormData(selectedNode.data || {});
        }
    }, [selectedNode]);

    const handleChange = (field: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        if (selectedNode) {
            onUpdate(selectedNode.id, formData);
        }
    };

    if (!selectedNode) return null;

    return (
        <div className="w-80 border-l border-neutral-800 bg-neutral-900 flex flex-col h-full absolute right-0 top-0 z-10 shadow-2xl">
            <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
                <span className="text-sm font-bold text-neutral-300">Configure {selectedNode.type}</span>
                <button onClick={onClose} className="p-1 hover:bg-neutral-800 rounded text-neutral-500 hover:text-white">
                    <X className="w-4 h-4" />
                </button>
            </div>
            
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-neutral-500 uppercase">Label</label>
                    <input 
                        className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-sm text-neutral-200 outline-none focus:border-purple-500"
                        value={formData.label || ''}
                        onChange={(e) => handleChange('label', e.target.value)}
                    />
                </div>

                {selectedNode.type === 'testNode' && (
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-neutral-500 uppercase">Test Case</label>
                        <select 
                            className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-sm text-neutral-200 outline-none focus:border-purple-500"
                            value={formData.testId || ''}
                            onChange={(e) => handleChange('testId', e.target.value)}
                        >
                            <option value="">Select a test...</option>
                            {testCases.map((tc: any) => (
                                <option key={tc.path} value={tc.path}>{tc.name}</option>
                            ))}
                        </select>
                    </div>
                )}

                {selectedNode.type === 'conditionNode' && (
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-neutral-500 uppercase">Condition (JS Expression)</label>
                        <textarea 
                            className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-sm text-neutral-200 outline-none focus:border-purple-500 h-24 font-mono"
                            value={formData.condition || ''}
                            onChange={(e) => handleChange('condition', e.target.value)}
                            placeholder="e.g. variables.status === 'success'"
                        />
                        <p className="text-[10px] text-neutral-600">Available: variables, lastOutput, globalInputs</p>
                    </div>
                )}

                {selectedNode.type === 'loopNode' && (
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-neutral-500 uppercase">Iterator Source</label>
                            <select 
                                className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-sm text-neutral-200 outline-none focus:border-purple-500"
                                value={formData.sourceType || 'variable'}
                                onChange={(e) => handleChange('sourceType', e.target.value)}
                            >
                                <option value="variable">Variable</option>
                                <option value="dataset">Dataset (CSV/JSON)</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-neutral-500 uppercase">Source Name</label>
                            <input 
                                className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-sm text-neutral-200 outline-none focus:border-purple-500"
                                value={formData.variable || ''}
                                onChange={(e) => handleChange('variable', e.target.value)}
                                placeholder={formData.sourceType === 'dataset' ? 'Dataset Name' : 'Variable Name'}
                            />
                        </div>
                    </div>
                )}

                {selectedNode.type === 'delayNode' && (
                     <div className="space-y-1">
                        <label className="text-xs font-bold text-neutral-500 uppercase">Duration (ms)</label>
                        <input 
                            type="number"
                            className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-sm text-neutral-200 outline-none focus:border-purple-500"
                            value={formData.duration || 0}
                            onChange={(e) => handleChange('duration', parseInt(e.target.value))}
                        />
                    </div>
                )}

                 {selectedNode.type === 'webhookNode' && (
                     <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-neutral-500 uppercase">URL</label>
                            <input 
                                className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-sm text-neutral-200 outline-none focus:border-purple-500"
                                value={formData.url || ''}
                                onChange={(e) => handleChange('url', e.target.value)}
                                placeholder="https://api.example.com/webhook"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-neutral-500 uppercase">Method</label>
                            <select 
                                className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-sm text-neutral-200 outline-none focus:border-purple-500"
                                value={formData.method || 'POST'}
                                onChange={(e) => handleChange('method', e.target.value)}
                            >
                                <option value="GET">GET</option>
                                <option value="POST">POST</option>
                                <option value="PUT">PUT</option>
                            </select>
                        </div>
                    </div>
                )}

                 {selectedNode.type === 'functionNode' && (
                     <div className="space-y-1">
                        <label className="text-xs font-bold text-neutral-500 uppercase">Function Name</label>
                         <input 
                            className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-sm text-neutral-200 outline-none focus:border-purple-500"
                            value={formData.functionName || ''}
                            onChange={(e) => handleChange('functionName', e.target.value)}
                        />
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-neutral-800 space-y-3">
                <button 
                    onClick={handleSave} 
                    className="w-full flex items-center justify-center space-x-2 bg-neutral-800 hover:bg-neutral-700 text-white py-2 rounded-xl text-sm font-bold transition-all"
                >
                    <Save className="w-4 h-4" />
                    <span>Apply Changes</span>
                </button>
                <button 
                    onClick={() => selectedNode && onDelete(selectedNode.id)} 
                    className="w-full flex items-center justify-center space-x-2 bg-red-900/20 hover:bg-red-900/40 text-red-500 py-2 rounded-xl text-sm font-bold transition-all border border-red-900/50"
                >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Node</span>
                </button>
            </div>
        </div>
    );
}
