
import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    // Next.js 15+ params are async
    const { id } = await params;
    
  try {
    const workflow = db.prepare('SELECT * FROM workflows WHERE id = ?').get(id);
    if (!workflow) {
      return NextResponse.json({ success: false, error: 'Workflow not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, workflow });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
  try {
    const body = await req.json();
    const { name, description, definition_json } = body;

    const stmt = db.prepare(`
      UPDATE workflows 
      SET name = ?, description = ?, definition_json = ?, updated_at = CURRENT_TIMESTAMP, version = version + 1
      WHERE id = ?
    `);

    const result = stmt.run(name, description, definition_json, id);

    if (result.changes === 0) {
      return NextResponse.json({ success: false, error: 'Workflow not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
  try {
    const stmt = db.prepare('DELETE FROM workflows WHERE id = ?');
    const result = stmt.run(id);

    if (result.changes === 0) {
      return NextResponse.json({ success: false, error: 'Workflow not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
