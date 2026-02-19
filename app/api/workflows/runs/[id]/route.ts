
import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const runId = id;
        
        // Fetch Run
        const run = db.prepare('SELECT * FROM workflow_runs WHERE id = ?').get(runId) as any;
        if (!run) {
            return NextResponse.json({ success: false, error: 'Run not found' }, { status: 404 });
        }

        // Fetch Node Executions
        const executions = db.prepare('SELECT * FROM node_executions WHERE workflow_run_id = ? ORDER BY executed_at ASC').all(runId);
        
        // Fetch Workflow Denifition Snapshot (or join)
        // Ideally we should have stored the snapshot in run, but if not we can join workflow
        // Check if workflow_runs has definition_snapshot or we use current definition
        // For now let's join workflow
        const workflow = db.prepare('SELECT definition_json FROM workflows WHERE id = ?').get(run.workflow_id) as any;

        return NextResponse.json({ 
            success: true, 
            run, 
            executions, 
            definition: workflow ? workflow.definition_json : null 
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
