
import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import util from 'util';
import fs from 'fs/promises';


const execAsync = util.promisify(exec);
const REPORT_FILE = 'cucumber-report.json';

export async function POST(req: Request) {
  try {
    const { features, tags } = await req.json(); // optional: run specific features/tags
    
    // Command to run cucumber
    // We use npx cucumber-js
    let command = 'npx cucumber-js';
    
    if (tags) {
        command += ` --tags "${tags}"`;
    }

    if (features && Array.isArray(features)) {
        command += ` ${features.join(' ')}`;
    }
    
    try {
        const { stdout } = await execAsync(command);
        
        // Read report
        let report = [];
        try {
            const reportContent = await fs.readFile(REPORT_FILE, 'utf-8');
            report = JSON.parse(reportContent);
        } catch { /* ignore if no report */ }

        return NextResponse.json({ success: true, logs: stdout, report });
    } catch (e: any) {
        // Cucumber exits with non-zero on test fail
         let report = [];
        try {
            const reportContent = await fs.readFile(REPORT_FILE, 'utf-8');
            report = JSON.parse(reportContent);
        } catch { /* ignore */ }
        
        return NextResponse.json({ success: true, result: false, logs: e.stdout + '\n' + e.stderr, report });
    }

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
