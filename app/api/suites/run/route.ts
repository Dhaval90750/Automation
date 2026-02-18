
import { NextResponse } from 'next/server';
import { getTestsWithTags, readTestFile } from '@/lib/files';
import { TestRunner } from '@/lib/test-runner';
import { runManager } from '@/lib/run-manager';

export async function POST(req: Request) {
  try {
    const { tag, concurrency = 1 } = await req.json();
    if (!tag) {
        return NextResponse.json({ error: 'Tag is required' }, { status: 400 });
    }

    const suites = await getTestsWithTags();
    const tests = suites[tag] || [];

    if (tests.length === 0) {
        return NextResponse.json({ success: true, results: [], message: 'No tests found for this tag' });
    }

    const results: any[] = [];
    const queue = [...tests];
    const workers = [];

    const runWorker = async () => {
        while (queue.length > 0) {
            const test = queue.shift();
            if (!test) break;

            try {
                const content = await readTestFile(test.path);
                const steps = Array.isArray(content) ? content : (content.steps || []);
                const runner = new TestRunner({ headless: true });
                const runKey = `suite-${tag}-${test.name}-${Date.now()}`;
                runManager.register(runKey, runner);
                
                try {
                    const result = await runner.runFlow(0, steps);
                    results.push({ name: test.name, success: result.success, duration: result.duration });
                } finally {
                    runManager.unregister(runKey);
                }
            } catch (e: any) {
                results.push({ name: test.name, success: false, error: e.message });
            }
        }
    };

    // Launch workers up to concurrency limit
    for (let i = 0; i < Math.min(concurrency, tests.length); i++) {
        workers.push(runWorker());
    }

    await Promise.all(workers);

    const totalPassed = results.filter(r => r.success).length;
    
    return NextResponse.json({ 
        success: true, 
        results, 
        summary: {
            total: results.length,
            passed: totalPassed,
            failed: results.length - totalPassed
        }
    });

  } catch (error: any) {
    console.error('Suite Runner Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
