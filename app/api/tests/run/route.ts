
import { NextResponse } from 'next/server';
import { TestRunner } from '@/lib/test-runner-v2';
import db from '@/lib/db';
import { runManager } from '@/lib/run-manager';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const steps: any[] = body.steps;

    if (!steps || !Array.isArray(steps)) {
      return NextResponse.json({ error: 'Invalid steps format' }, { status: 400 });
    }

    const data = body.data || {};
    const runner = new TestRunner();
    await runner.init();
    
    // Create a unique run ID for tracking if needed, though V2 handles artifacts internally
    
    try {
        const result = await runner.runTest(steps, data);
        await runner.close();
        return NextResponse.json({ success: true, result });
    } catch (e: any) {
        await runner.close();
        throw e;
    }
  } catch (error: any) {
    console.error('Test Runner Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
