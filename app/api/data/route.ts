
import { NextResponse } from 'next/server';
import { DataProvider } from '@/lib/data-provider';
import fs from 'fs/promises';
import pathLib from 'path';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const path = searchParams.get('path');
    
    if (!path) {
        // List files in data directory
        try {
            const dataDir = pathLib.join(process.cwd(), '../tests/data');
            // Ensure dir exists
            try { await fs.mkdir(dataDir, { recursive: true }); } catch (e) {}
            
            const files = await fs.readdir(dataDir);
            const dataFiles = files.filter(f => f.endsWith('.json') || f.endsWith('.csv'));
            return NextResponse.json({ success: true, files: dataFiles });
        } catch (e: any) {
            return NextResponse.json({ error: e.message }, { status: 500 });
        }
    }

    const data = await DataProvider.loadData('data/' + path);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, content } = await req.json();
    
    if (!name || !content) {
        return NextResponse.json({ error: 'Name and content required' }, { status: 400 });
    }
    
    // Basic validation
    if (!name.endsWith('.json') && !name.endsWith('.csv')) {
        return NextResponse.json({ error: 'Only .json and .csv files allowed' }, { status: 400 });
    }

    const dataDir = pathLib.join(process.cwd(), '../tests/data');
    try { await fs.mkdir(dataDir, { recursive: true }); } catch (e) {}
    
    await fs.writeFile(pathLib.join(dataDir, name), content, 'utf-8');
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get('name');
    
    if (!name) {
        return NextResponse.json({ error: 'Name required' }, { status: 400 });
    }

    const filePath = pathLib.join(process.cwd(), '../tests/data', name);
    await fs.unlink(filePath);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
