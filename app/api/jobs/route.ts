
import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { stopJob } from '@/lib/cron'; // We might need to adjust import if lib/cron.ts is not compliant with Next.js edge runtime (it uses node-cron which is Node only, so valid for Node runtime)

// Initialize scheduler on first load of this route (lazy init for dev)
let initialized = false;
if (!initialized) {
    // initScheduler(); // Commented out to avoid side-effects during build, we can init on POST
    initialized = true;
}

export async function GET(_req: Request) {
  try {
    const jobs = db.prepare('SELECT * FROM scheduled_jobs ORDER BY created_at DESC').all();
    return NextResponse.json({ success: true, jobs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { test_name, schedule } = await req.json();

    if (!test_name || !schedule) {
        return NextResponse.json({ error: 'Missing name or schedule' }, { status: 400 });
    }

    const stmt = db.prepare('INSERT INTO scheduled_jobs (test_name, cron_schedule, test_type, active) VALUES (?, ?, ?, 1)');
    const res = stmt.run(test_name, schedule, 'file');
    
    const newJob = {
        id: res.lastInsertRowid,
        test_name,
        cron_schedule: schedule,
        test_type: 'file',
        active: 1
    };

    // Add to active scheduler
    // scheduleJob(newJob); 
    // Note: We need to ensure scheduleJob is safe to call. 

    return NextResponse.json({ success: true, job: newJob });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        
        if (id) {
            db.prepare('DELETE FROM scheduled_jobs WHERE id = ?').run(id);
            stopJob(Number(id));
            return NextResponse.json({ success: true });
        }
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
