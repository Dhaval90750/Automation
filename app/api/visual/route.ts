
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const SNAPSHOTS_DIR = path.join(process.cwd(), '../tests/snapshots');

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type'); // baseline, actual, diff
    const name = searchParams.get('name'); // snapshot name

    if (type && name) {
        // Return base64 of specific image
        const subDir = type === 'baseline' ? 'baseline' : (type === 'actual' ? 'actual' : 'diffs');
        const ext = type === 'diff' ? '.diff.png' : '.png';
        const filePath = path.join(SNAPSHOTS_DIR, subDir, `${name}${ext}`);
        
        try {
            const buffer = await fs.readFile(filePath);
            const base64 = buffer.toString('base64');
            return NextResponse.json({ success: true, image: `data:image/png;base64,${base64}` });
        } catch (e) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }
    }

    // List all snapshots
    const snapshots: string[] = [];
    try {
        const baselineDir = path.join(SNAPSHOTS_DIR, 'baseline');
        const files = await fs.readdir(baselineDir);
        files.forEach(f => {
            if (f.endsWith('.png')) snapshots.push(f.replace('.png', ''));
        });
    } catch (e) { /* ignore if dir doesn't exist */ }

    return NextResponse.json({ success: true, snapshots });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
