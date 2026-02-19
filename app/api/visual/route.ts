
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const SNAPSHOTS_DIR = path.join(process.cwd(), 'tests', 'snapshots');

export async function GET() {
    try {
        const diffsDir = path.join(SNAPSHOTS_DIR, 'diffs');
        if (!fs.existsSync(diffsDir)) return NextResponse.json({ success: true, diffs: [] });

        const files = fs.readdirSync(diffsDir).filter(f => f.endsWith('.diff.png'));
        const diffs = files.map(file => {
            const name = file.replace('.diff.png', '');
            return {
                name,
                baseline: `/api/visual/image?type=baseline&name=${name}`,
                actual: `/api/visual/image?type=actual&name=${name}`,
                diff: `/api/visual/image?type=diff&name=${name}`
            };
        });

        return NextResponse.json({ success: true, diffs });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { name, action } = await req.json();
        
        if (action === 'approve') {
            const actualPath = path.join(SNAPSHOTS_DIR, 'actual', `${name}.png`);
            const baselinePath = path.join(SNAPSHOTS_DIR, 'baseline', `${name}.png`);
            const diffPath = path.join(SNAPSHOTS_DIR, 'diffs', `${name}.diff.png`);
            
            if (fs.existsSync(actualPath)) {
                fs.copyFileSync(actualPath, baselinePath);
                // Clear failure artifacts
                if (fs.existsSync(diffPath)) fs.unlinkSync(diffPath);
                if (fs.existsSync(actualPath)) fs.unlinkSync(actualPath);
            }
        } else if (action === 'reject') {
            // Just clear the actual/diff? Or keep it?
            // Usually we want to keep it to investigate, but if rejected, maybe we just do nothing or clear diff
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
