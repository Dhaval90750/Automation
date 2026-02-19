
import { NextResponse } from 'next/server';
import { listDatasets, saveDataset, getDatasetData } from '@/lib/datasets';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (id) {
             const data = getDatasetData(parseInt(id));
             return NextResponse.json({ success: true, data });
        } else {
             const datasets = listDatasets();
             return NextResponse.json({ success: true, datasets });
        }
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, type, content } = body;

        if (!name || !type || !content) {
            return NextResponse.json({ success: false, error: 'Name, Type, and Content are required' }, { status: 400 });
        }

        const id = await saveDataset(name, type, content);
        return NextResponse.json({ success: true, id });
    } catch (error: any) {
        if (error.message.includes('UNIQUE constraint failed')) {
             return NextResponse.json({ success: false, error: 'Dataset name already exists' }, { status: 409 });
        }
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
