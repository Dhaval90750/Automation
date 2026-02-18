
import { NextResponse } from 'next/server';
import { getTestsWithTags } from '@/lib/files';

export async function GET() {
  try {
    const suites = await getTestsWithTags();
    return NextResponse.json({ success: true, suites });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
