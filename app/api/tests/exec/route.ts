
import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import util from 'util';
import db from '@/lib/db';
import fs from 'fs/promises';
import path from 'path';

const execAsync = util.promisify(exec);

export async function POST(req: Request) {
  const startTime = Date.now();
  let runId: number | bigint = 0;
  
  try {
    const { path: filePath } = await req.json();

    if (!filePath) {
        return NextResponse.json({ error: 'Missing file path' }, { status: 400 });
    }

    // Initialize run record
    const insertRun = db.prepare('INSERT INTO test_runs (flow_id, status, logs, test_path) VALUES (?, ?, ?, ?)');
    const info = insertRun.run(0, 'running', 'Execution started...', filePath);
    runId = info.lastInsertRowid;

    let command = '';
    
    // Determine command based on extension and add screenshot flags
    if (filePath.endsWith('.py')) {
        command = `python -m pytest "${filePath}" --screenshot=on`;
    } else if (filePath.endsWith('.js') || filePath.endsWith('.ts')) {
        command = `npx playwright test "${filePath}" --reporter=line --screenshot=on`; 
    } else {
        return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
    }

    try {
        const { stdout, stderr } = await execAsync(command);
        const logs = (stdout + '\n' + stderr);
        const duration = Date.now() - startTime;
        
        // Try to find screenshot
        let screenshotPath = '';
        try {
            const resultsDir = path.join(process.cwd(), 'test-results');
            const dirs = await fs.readdir(resultsDir);
            if (dirs.length > 0) {
                // Find latest screenshot in latest result dir
                const latestDir = dirs.sort().reverse()[0];
                const shotFiles = await fs.readdir(path.join(resultsDir, latestDir));
                const shot = shotFiles.find(f => f.endsWith('.png'));
                if (shot) {
                    const newName = `run_${runId}_${Date.now()}.png`;
                    const publicPath = path.join(process.cwd(), 'public', 'screenshots', newName);
                    await fs.copyFile(path.join(resultsDir, latestDir, shot), publicPath);
                    screenshotPath = `/screenshots/${newName}`;
                }
            }
        } catch (e) {}

        db.prepare('UPDATE test_runs SET status = ?, logs = ?, duration_ms = ?, screenshot = ? WHERE id = ?')
          .run('passed', logs, duration, screenshotPath, runId);

        return NextResponse.json({ success: true, logs: logs.split('\n'), result: true, screenshot: screenshotPath });
    } catch (e: any) {
        const logs = (e.stdout + '\n' + e.stderr);
        const duration = Date.now() - startTime;

        // Try to find screenshot on failure
        let screenshotPath = '';
        try {
            const resultsDir = path.join(process.cwd(), 'test-results');
            const dirs = await fs.readdir(resultsDir);
            if (dirs.length > 0) {
                const latestDir = dirs.sort().reverse()[0];
                const shotFiles = await fs.readdir(path.join(resultsDir, latestDir));
                const shot = shotFiles.find(f => f.endsWith('.png'));
                if (shot) {
                    const newName = `run_${runId}_fail_${Date.now()}.png`;
                    const publicPath = path.join(process.cwd(), 'public', 'screenshots', newName);
                    await fs.copyFile(path.join(resultsDir, latestDir, shot), publicPath);
                    screenshotPath = `/screenshots/${newName}`;
                }
            }
        } catch (err) {}

        db.prepare('UPDATE test_runs SET status = ?, logs = ?, duration_ms = ?, screenshot = ? WHERE id = ?')
          .run('failed', logs, duration, screenshotPath, runId);

        return NextResponse.json({ success: true, result: false, logs: logs.split('\n'), screenshot: screenshotPath });
    }

  } catch (error: any) {
    if (runId) {
        db.prepare('UPDATE test_runs SET status = ?, logs = ? WHERE id = ?').run('failed', error.message, runId);
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
