
import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const workflows = db.prepare('SELECT * FROM workflows ORDER BY updated_at DESC').all();
    return NextResponse.json({ success: true, workflows });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description, definition_json } = body;

    if (!name || !definition_json) {
      return NextResponse.json({ success: false, error: 'Name and definition are required' }, { status: 400 });
    }

    const stmt = db.prepare(`
      INSERT INTO workflows (name, description, definition_json)
      VALUES (?, ?, ?)
    `);

    const result = stmt.run(name, description || '', definition_json);

    return NextResponse.json({ success: true, id: result.lastInsertRowid });
  } catch (error: any) {
      if (error.message.includes('UNIQUE constraint failed')) {
          return NextResponse.json({ success: false, error: 'Workflow name already exists' }, { status: 409 });
      }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
