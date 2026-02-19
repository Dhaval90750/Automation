
import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import db from '@/lib/db';
import fs from 'fs/promises';
import path from 'path';

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
    let args: string[] = [];
    
    // Determine command based on extension
    const ext = path.extname(filePath).toLowerCase();
    
    const LANGUAGE_MAP: Record<string, { command: string, args: string[] }> = {
        '.py': { command: 'python', args: ['-m', 'pytest', filePath] },
        '.js': { command: 'npx', args: ['playwright', 'test', filePath, '--reporter=line'] },
        '.ts': { command: 'npx', args: ['playwright', 'test', filePath, '--reporter=line'] },
        '.rb': { command: 'ruby', args: [filePath] },
        '.go': { command: 'go', args: ['run', filePath] },
        '.php': { command: 'php', args: [filePath] },
        '.java': { command: 'java', args: [filePath] },
        '.sh': { command: 'bash', args: [filePath] },
        '.ps1': { command: 'powershell', args: ['-ExecutionPolicy', 'Bypass', '-File', filePath] },
        '.bat': { command: 'cmd', args: ['/c', filePath] },
        '.cmd': { command: 'cmd', args: ['/c', filePath] },
        '.pl': { command: 'perl', args: [filePath] },
        '.lua': { command: 'lua', args: [filePath] },
        '.r': { command: 'Rscript', args: [filePath] },
        '.rs': { command: 'rustc', args: [filePath] }, // Compile only? Typically cargo run is used for projects
        '.dart': { command: 'dart', args: ['run', filePath] },
    };

    const config = LANGUAGE_MAP[ext];

    if (config) {
        command = config.command;
        args = config.args;
    } else {
        // Fallback or Error
        // Try to execute directly if it has no extension or unknown
         return NextResponse.json({ error: `Unsupported file type: ${ext}` }, { status: 400 });
    }

    const encoder = new TextEncoder();
    const customStream = new ReadableStream({
        start(controller) {
            const child = spawn(command, args, { shell: true });
            let logs = '';

            const handleData = (data: Buffer) => {
                const text = data.toString();
                logs += text;
                controller.enqueue(encoder.encode(text));
            };

            child.stdout.on('data', handleData);
            child.stderr.on('data', handleData);

            child.on('close', async (code) => {
                const duration = Date.now() - startTime;
                let status = code === 0 ? 'passed' : 'failed';
                
                // Screenshot handling (same logic as before)
                let screenshotPath = '';
                try {
                    const resultsDir = path.join(process.cwd(), 'test-results');
                    const dirs = await fs.readdir(resultsDir);
                    if (dirs.length > 0) {
                        const latestDir = dirs.sort().reverse()[0];
                        const shotFiles = await fs.readdir(path.join(resultsDir, latestDir));
                        const shot = shotFiles.find(f => f.endsWith('.png'));
                        if (shot) {
                             const newName = `run_${runId}_${status}_${Date.now()}.png`;
                             const publicPath = path.join(process.cwd(), 'public', 'screenshots', newName);
                             await fs.copyFile(path.join(resultsDir, latestDir, shot), publicPath);
                             screenshotPath = `/screenshots/${newName}`;
                        }
                    }
                } catch (_e) {}

                // Update DB
                db.prepare('UPDATE test_runs SET status = ?, logs = ?, duration_ms = ?, screenshot = ? WHERE id = ?')
                  .run(status, logs, duration, screenshotPath, runId);
                
                controller.close();
            });

            child.on('error', (err) => {
                logs += `\nError: ${err.message}`;
                db.prepare('UPDATE test_runs SET status = ?, logs = ? WHERE id = ?')
                  .run('failed', logs, runId);
                controller.enqueue(encoder.encode(`\nError: ${err.message}`));
                controller.close();
            });
        }
    });

    return new NextResponse(customStream, {
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Transfer-Encoding': 'chunked',
        },
    });

  } catch (error: any) {
    if (runId) {
        db.prepare('UPDATE test_runs SET status = ?, logs = ? WHERE id = ?').run('failed', error.message, runId);
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
