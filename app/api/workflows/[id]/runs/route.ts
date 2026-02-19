
import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const workflowId = id;
        
        // Fetch runs ordered by created_at DESC
        const runs = db.prepare('SELECT * FROM workflow_runs WHERE workflow_id = ? ORDER BY created_at DESC').all(workflowId);

        return NextResponse.json({ success: true, runs });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
