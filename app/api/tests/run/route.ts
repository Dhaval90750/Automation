
import { NextResponse } from 'next/server';
import { TestRunner, TestStep } from '@/lib/test-runner';
import { runManager } from '@/lib/run-manager';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const steps: TestStep[] = body.steps;

    if (!steps || !Array.isArray(steps)) {
      return NextResponse.json({ error: 'Invalid steps format' }, { status: 400 });
    }

    const data = body.data || {};
    const runner = new TestRunner();
    const runKey = `adhoc-${Date.now()}`;
    runManager.register(runKey, runner);
    
    try {
        const result = await runner.runFlow(0, steps, data);
        return NextResponse.json({ success: true, result });
    } finally {
        runManager.unregister(runKey);
    }
  } catch (error: any) {
    console.error('Test Runner Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
