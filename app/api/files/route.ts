
import { NextResponse } from 'next/server';
import { listFiles, saveTestFile } from '@/lib/files';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const dir = searchParams.get('dir') || '';
    
    const files = await listFiles(dir);
    return NextResponse.json({ success: true, files });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { path, content } = await req.json();
    
    if (!path || !content) {
      return NextResponse.json({ error: 'Path and content required' }, { status: 400 });
    }

    await saveTestFile(path, content);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const path = searchParams.get('path');
    
    if (!path) {
      return NextResponse.json({ error: 'Path required' }, { status: 400 });
    }

    const { deleteTestFile } = await import('@/lib/files');
    await deleteTestFile(path);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
