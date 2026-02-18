
import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(req: Request) {
  try {
    const runs = db.prepare(`
        SELECT 
            r.id, 
            r.status, 
            r.duration_ms, 
            r.screenshot,
            r.logs,
            r.test_path,
            r.created_at, 
            f.name as flow_name 
        FROM test_runs r
        LEFT JOIN test_flows f ON r.flow_id = f.id
        ORDER BY r.created_at DESC
        LIMIT 50
    `).all();

    const stats = db.prepare(`
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN status = 'passed' THEN 1 ELSE 0 END) as passed,
            SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
            AVG(duration_ms) as avg_duration
        FROM test_runs
    `).get();

    return NextResponse.json({ success: true, runs, stats });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
