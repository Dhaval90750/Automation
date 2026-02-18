
import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type'); // 'pages' or 'selectors'
    const pageId = searchParams.get('pageId');

    if (type === 'pages') {
        const stmt = db.prepare('SELECT * FROM pages ORDER BY name');
        const pages = stmt.all();
        return NextResponse.json({ success: true, data: pages });
    }

    if (type === 'selectors') {
        let query = 'SELECT * FROM selectors';
        const params = [];
        if (pageId) {
            query += ' WHERE page_id = ?';
            params.push(pageId);
        }
        const stmt = db.prepare(query);
        const selectors = stmt.all(...params);
        return NextResponse.json({ success: true, data: selectors });
    }

    if (type === 'tests') {
        let query = 'SELECT * FROM page_tests';
        const params = [];
        if (pageId) {
            query += ' WHERE page_id = ?';
            params.push(pageId);
        }
        const stmt = db.prepare(query);
        const tests = stmt.all(...params);
        return NextResponse.json({ success: true, data: tests });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type } = body;

    if (type === 'page') {
        const { name, url, description } = body;
        const stmt = db.prepare('INSERT INTO pages (name, url, description) VALUES (?, ?, ?)');
        const res = stmt.run(name, url, description);
        return NextResponse.json({ success: true, id: res.lastInsertRowid });
    }

    if (type === 'selector') {
        const { pageId, name, selector, elementType, description } = body;
        const stmt = db.prepare('INSERT INTO selectors (page_id, name, selector, type, description) VALUES (?, ?, ?, ?, ?)');
        const res = stmt.run(pageId, name, selector, elementType, description);
        return NextResponse.json({ success: true, id: res.lastInsertRowid });
    }

    if (type === 'test') {
        const { pageId, name, steps, description } = body;
        const stmt = db.prepare('INSERT INTO page_tests (page_id, name, steps, description) VALUES (?, ?, ?, ?)');
        const res = stmt.run(pageId, name, JSON.stringify(steps), description);
        return NextResponse.json({ success: true, id: res.lastInsertRowid });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    if (type === 'page') {
        db.prepare('DELETE FROM selectors WHERE page_id = ?').run(id);
        db.prepare('DELETE FROM page_tests WHERE page_id = ?').run(id);
        db.prepare('DELETE FROM pages WHERE id = ?').run(id);
        return NextResponse.json({ success: true });
    }

    if (type === 'selector') {
        db.prepare('DELETE FROM selectors WHERE id = ?').run(id);
        return NextResponse.json({ success: true });
    }

    if (type === 'test') {
        db.prepare('DELETE FROM page_tests WHERE id = ?').run(id);
        return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
