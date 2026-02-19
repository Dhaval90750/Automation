
import cron, { ScheduledTask } from 'node-cron';
import db from './db';
import { TestRunner } from './test-runner-v2';
import { WorkflowRunner } from './workflow-runner';
import fs from 'fs'; // Sync fs for simplicity in server-side init, or promise-based. Let's use fs/promises or just fs since it's server-side Node.
import path from 'path';
import cronParser from 'cron-parser';

// Store running tasks in memory for cancellation
const activeTasks: Record<string, ScheduledTask> = {};

export function initScheduler() {
    console.log('[Scheduler] Initializing Persistent Scheduler...');
    
    // Load active jobs from DB
    try {
        const jobs = db.prepare('SELECT * FROM scheduled_jobs WHERE active = 1').all() as any[];
        
        jobs.forEach(job => {
            scheduleJob(job);
        });
        
        console.log(`[Scheduler] Loaded and scheduled ${jobs.length} jobs.`);
    } catch (e) {
        console.error('[Scheduler] Failed to initialize:', e);
    }
}

export function scheduleJob(job: any) {
    if (activeTasks[job.id]) {
        activeTasks[job.id].stop();
    }

    if (!job.active) return;

    console.log(`[Scheduler] Scheduling Job #${job.id} for ${job.test_type} '${job.test_name || job.test_id}' at ${job.cron_schedule}`);

    try {
        // Validate Cron
        if (!cron.validate(job.cron_schedule)) {
            console.error(`[Scheduler] Invalid cron schedule for Job #${job.id}: ${job.cron_schedule}`);
            return;
        }

        // Calculate and save initial next_run if null
        updateNextRun(job.id, job.cron_schedule);

        const task = cron.schedule(job.cron_schedule, async () => {
            console.log(`[Scheduler] Running Job #${job.id}: ${job.test_name}`);
            
            try {
                // Execute Logic
                if (job.test_type === 'file') {
                    await runFileJob(job);
                } else if (job.test_type === 'workflow') {
                    await runWorkflowJob(job);
                }

                // Update Stats
                const now = new Date().toISOString();
                db.prepare('UPDATE scheduled_jobs SET last_run = ? WHERE id = ?').run(now, job.id);
                updateNextRun(job.id, job.cron_schedule);

            } catch (e: any) {
                console.error(`[Scheduler] Job #${job.id} Failed:`, e);
            }
        });

        activeTasks[job.id] = task;
    } catch (e) {
        console.error(`[Scheduler] Failed to schedule Job #${job.id}:`, e);
    }
}

function updateNextRun(jobId: number, cronExpression: string) {
    try {
        const interval = cronParser.parse(cronExpression);
        const next = interval.next().toISOString();
        db.prepare('UPDATE scheduled_jobs SET next_run = ? WHERE id = ?').run(next, jobId);
    } catch (e) {
        console.error(`[Scheduler] Failed to calculate next_run for Job #${jobId}`, e);
    }
}

async function runFileJob(job: any) {
    // Only supports JSON flows for now via TestRunner
    const testFolder = path.join(process.cwd(), 'tests'); // Or wherever tests are stored
    // Check if test_name exists. For now, we assume simple path relative to root or 'tests' folder?
    // The previous implementation used path.join(process.cwd(), '../tests', job.test_name), implying 'tests' is sibling to 'automation-platform'.
    // BUT user has 'tests' dir inside 'automation-platform' (see step 664 list_dir: "tests","isDir":true).
    
    // Let's assume absolute path or relative to project root.
    // If job.test_name is just filename:
    const possiblePaths = [
        path.join(process.cwd(), 'tests', job.test_name),
        path.join(process.cwd(), job.test_name)
    ];

    let filePath = possiblePaths.find(p => fs.existsSync(p));
    
    if (!filePath) {
        throw new Error(`Test file not found: ${job.test_name}`);
    }

    if (filePath.endsWith('.json')) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const steps = JSON.parse(content);
        
        const runner = new TestRunner();
        await runner.init(true); // Headless
        await runner.runTest(steps, {});
        await runner.close();
    } else {
        throw new Error('Only .json test flows are supported by the persistent scheduler currently.');
    }
}

async function runWorkflowJob(job: any) {
    const workflowId = job.test_id; // For workflows, we use test_id as workflow_id
    const runner = new WorkflowRunner(workflowId);
    await runner.start();
}

export function stopJob(jobId: number) {
    if (activeTasks[jobId]) {
        activeTasks[jobId].stop();
        delete activeTasks[jobId];
    }
    // Update DB to paused? Or just stop in memory?
    // If called from DELETE, row is gone. If just stopping, we might want to flag as inactive.
    // For now, this is Memory Stop.
}
