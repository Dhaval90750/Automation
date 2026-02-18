
import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import util from 'util';
import fs from 'fs/promises';
import path from 'path';


// Store the recorder process reference
let recorderProcess: any = null;

const execAsync = util.promisify(exec);
// Dynamic temp file path based on language
const getTempFile = (lang: string) => path.join(process.cwd(), `temp_recording.${lang === 'python' ? 'py' : 'js'}`);

export async function POST(req: Request) {
  try {
        const { action, url, language } = await req.json();
        const tempFile = getTempFile(language || 'javascript');

        if (action === 'start') {
            // Start Codegen and save to temp file
            // --target python if needed
            const targetFlag = language === 'python' ? '--target python' : '';
            const command = `npx playwright codegen ${url || ''} --output "${tempFile}" ${targetFlag} --viewport-size=1920,1080`;
            
            recorderProcess = exec(command, (error, stdout, stderr) => {
            if (error) console.error('Codegen Error:', error);
            recorderProcess = null;
        });

        return NextResponse.json({ success: true, message: 'Recorder started.' });
    }

    if (action === 'stop') {
        // Kill the process if running
        if (recorderProcess) {
            // On Windows, killing the shell might not kill the child. 
            // We use taskkill to be sure, targeting the process group or just the pid
            try {
                process.kill(recorderProcess.pid); // Attempt graceful kill
                // Force kill if needed (on Windows tree kill is better)
                exec(`taskkill /pid ${recorderProcess.pid} /T /F`);
            } catch (e) {
                console.log("Error killing recorder:", e);
            }
            recorderProcess = null;
        }

        // Read the temp file - try both potential extensions if language not passed, or just look for what matches
        // Actually, we should track what language was started. For now, let's just try reading both or check file existence.
        // Or assume the user passes the same language 'stop' as 'start' (UI should handle this).
        // Let's just try both.
        try {
            let content = '';
            try {
                content = await fs.readFile(getTempFile('javascript'), 'utf-8');
            } catch {
                content = await fs.readFile(getTempFile('python'), 'utf-8');
            }
            
            return NextResponse.json({ success: true, code: content });
        } catch (e) {
            return NextResponse.json({ success: false, error: 'No recording found or file empty.' });
        }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
