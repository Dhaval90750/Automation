
import { NextResponse } from 'next/server';
import { readTestFile } from '@/lib/files';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const path = searchParams.get('path');
    
    if (!path) {
      return NextResponse.json({ error: 'File path required' }, { status: 400 });
    }

    const content = await readTestFile(path);
    return NextResponse.json({ success: true, content });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
}
