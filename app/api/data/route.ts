
import { NextResponse } from 'next/server';
import { DataProvider } from '@/lib/data-provider';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const path = searchParams.get('path');
    
    if (!path) {
        return NextResponse.json({ error: 'Path required' }, { status: 400 });
    }

    const data = await DataProvider.loadData(path);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
