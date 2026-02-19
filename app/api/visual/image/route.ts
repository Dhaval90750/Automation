
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const SNAPSHOTS_DIR = path.join(process.cwd(), 'tests', 'snapshots');

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type'); // baseline, actual, diff
    const name = searchParams.get('name');

    if (!type || !name) return new NextResponse('Missing params', { status: 400 });

    const filePath = path.join(SNAPSHOTS_DIR, type === 'diff' ? 'diffs' : type, type === 'diff' ? `${name}.diff.png` : `${name}.png`);

    if (!fs.existsSync(filePath)) return new NextResponse('Image not found', { status: 404 });

    const imageBuffer = fs.readFileSync(filePath);
    return new NextResponse(imageBuffer, {
        headers: { 'Content-Type': 'image/png' }
    });
}
