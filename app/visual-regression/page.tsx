
'use client';

import { useState, useEffect } from 'react';

export default function VisualRegressionPage() {
    const [diffs, setDiffs] = useState<any[]>([]);

    const fetchDiffs = async () => {
        const res = await fetch('/api/visual');
        const data = await res.json();
        if (data.success) {
            setDiffs(data.diffs);
        }
    };

    useEffect(() => {
        fetchDiffs();
    }, []);

    const handleAction = async (name: string, action: 'approve' | 'reject') => {
        await fetch('/api/visual', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, action })
        });
        fetchDiffs();
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6">Visual Regression Review</h1>
            
            {diffs.length === 0 ? (
                <p>No diffs to review.</p>
            ) : (
                <div className="space-y-8">
                    {diffs.map((diff) => (
                        <div key={diff.name} className="border p-4 rounded shadow">
                            <h2 className="text-xl font-semibold mb-2">{diff.name}</h2>
                            <div className="flex gap-4 mb-4 overflow-x-auto">
                                <div>
                                    <p className="font-bold mb-1">Baseline</p>
                                    <img src={diff.baseline} alt="Baseline" className="max-w-md border" />
                                </div>
                                <div>
                                    <p className="font-bold mb-1">Actual</p>
                                    <img src={diff.actual} alt="Actual" className="max-w-md border" />
                                </div>
                                <div>
                                    <p className="font-bold mb-1">Diff</p>
                                    <img src={diff.diff} alt="Diff" className="max-w-md border" />
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => handleAction(diff.name, 'approve')}
                                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                                >
                                    Approve (Update Baseline)
                                </button>
                                <button
                                    onClick={() => handleAction(diff.name, 'reject')}
                                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                >
                                    Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
