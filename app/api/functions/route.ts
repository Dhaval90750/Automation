
import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
    try {
        const functions = db.prepare('SELECT * FROM functions ORDER BY updated_at DESC').all();
        return NextResponse.json({ success: true, functions });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, code, param_schema } = body;

        if (!name || !code) {
             return NextResponse.json({ success: false, error: 'Name and Code are required' }, { status: 400 });
        }

        const stmt = db.prepare('INSERT INTO functions (name, code, param_schema) VALUES (?, ?, ?)');
        const result = stmt.run(name, code, param_schema || '{}');

        return NextResponse.json({ success: true, id: result.lastInsertRowid });
    } catch (error: any) {
        if (error.message.includes('UNIQUE constraint failed')) {
             return NextResponse.json({ success: false, error: 'Function name already exists' }, { status: 409 });
        }
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
