
import { NextResponse } from 'next/server';
import { WorkflowRunner } from '@/lib/workflow-runner';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const workflowId = parseInt(id);
    
    if (isNaN(workflowId)) {
        return NextResponse.json({ success: false, error: 'Invalid ID' }, { status: 400 });
    }

    const runner = new WorkflowRunner(workflowId);
    // Start async? Or await? For long running workflows, async is better.
    // But Vercel serverless has timeout. Self-hosted Node is fine.
    // Assuming local Node.js environment.
    
    // We'll await for MVP to see result immediately, but in production this should be background job.
    try {
        const runId = await runner.start();
        return NextResponse.json({ success: true, runId });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
