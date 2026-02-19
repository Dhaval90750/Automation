import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const SETTINGS_FILE = path.join(process.cwd(), 'nexus-settings.json');

// Helper to read settings
const getSettings = () => {
    if (!fs.existsSync(SETTINGS_FILE)) {
        return {};
    }
    try {
        return JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'));
    } catch (e) {
        return {};
    }
};

export async function GET() {
    return NextResponse.json({ success: true, settings: getSettings() });
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const current = getSettings();
        const updated = { ...current, ...body };
        
        fs.writeFileSync(SETTINGS_FILE, JSON.stringify(updated, null, 2));
        
        // Also try to update process.env for the current runtime if needed, 
        // though strictly usually env vars are read at start. 
        // For dynamic runtime usage, we should read from this file or DB.
        
        return NextResponse.json({ success: true, settings: updated });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
