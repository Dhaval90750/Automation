
import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { WorkflowRunner } from '@/lib/workflow-runner';

export async function POST(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const token = req.headers.get('Authorization'); // Simple bearer or query param?
        // For Local First, maybe just a simple shared secret or even open if local.
        // Let's implement a simple secret check if configured.
        
        // TODO: check settings for webhook secret? skipping for MVP.
        
        const workflowId = searchParams.get('workflowId');
        const workflowName = searchParams.get('name');
        
        if (!workflowId && !workflowName) {
            return NextResponse.json({ error: 'Missing workflowId or name' }, { status: 400 });
        }

        let id = workflowId;
        if (!id && workflowName) {
            const wf = db.prepare('SELECT id FROM workflows WHERE name = ?').get(workflowName) as any;
            if (!wf) return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
            id = wf.id;
        }

        const body = await req.json().catch(() => ({})); // Optional body

        const runner = new WorkflowRunner(Number(id), body);
        
        // Asynchronous trigger? Or wait? 
        // Usually webhooks want fast response.
        const runId = await runner.start(); 

        return NextResponse.json({ 
            success: true, 
            runId, 
            message: 'Workflow triggered successfully' 
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
