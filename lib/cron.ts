
import cron, { ScheduledTask } from 'node-cron';
import db from './db';
import { TestRunner } from './test-runner';
import fs from 'fs/promises';
import path from 'path';

// Store running tasks in memory
const activeTasks: Record<string, ScheduledTask> = {};

export function initScheduler() {
    console.log('[Scheduler] Initializing...');
    
    // Load active jobs from DB
    const jobs = db.prepare('SELECT * FROM scheduled_jobs WHERE active = 1').all() as any[];
    
    jobs.forEach(job => {
        scheduleJob(job);
    });
    
    console.log(`[Scheduler] Loaded ${jobs.length} jobs.`);
}

export function scheduleJob(job: any) {
    if (activeTasks[job.id]) {
        activeTasks[job.id].stop();
    }

    if (!job.active) return;

    console.log(`[Scheduler] Scheduling Job #${job.id} for test ${job.test_name} at ${job.cron_schedule}`);

    const task = cron.schedule(job.cron_schedule, async () => {
        console.log(`[Scheduler] Running Job #${job.id}: ${job.test_name}`);
        
        try {
            // Update last run time
            db.prepare('UPDATE scheduled_jobs SET last_run = CURRENT_TIMESTAMP WHERE id = ?').run(job.id);

            // Execute Test
            // For now, we support running saved files by name
            if (job.test_type === 'file') {
                 // We need to read the file and run it
                 // This requires the TestRunner to support running raw file content or parsed steps
                 // Since our current runner runs 'flows' from DB or raw steps, let's adapt.
                 
                 // 1. Read file
                 const filePath = path.join(process.cwd(), '../tests', job.test_name);
                 const content = await fs.readFile(filePath, 'utf-8');
                 
                 // If it's a JSON file with steps
                 if (job.test_name.endsWith('.json')) {
                     const steps = JSON.parse(content);
                     const runner = new TestRunner();
                     await runner.runFlow(0, steps); // 0 = ad-hoc ID
                 } 
                 // If it's a .spec.ts file, we might need a different runner (Playwright Test)
                 // For now, let's assume JSON steps for the integrated runner
            }
        } catch (e) {
            console.error(`[Scheduler] Job #${job.id} Failed:`, e);
        }
    });

    activeTasks[job.id] = task;
}

export function stopJob(jobId: number) {
    if (activeTasks[jobId]) {
        activeTasks[jobId].stop();
        delete activeTasks[jobId];
    }
}
