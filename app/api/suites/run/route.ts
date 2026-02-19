import { NextResponse } from 'next/server';
import { getTestsWithTags, readTestFile } from '@/lib/files';
import { TestRunner } from '@/lib/test-runner-v2';

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
    
    // We will process the queue sequentially for now to avoid complexity with multiple browsers in one request, 
    // or limit concurrency if we implement it.
    
    // Helper to process one test
    const runTest = async (test: any) => {
        try {
            const content = await readTestFile(test.path);
            const steps = Array.isArray(content) ? content : (content.steps || []);
            
            const runner = new TestRunner();
            await runner.init(true); // Headless
            
            try {
                const result = await runner.runTest(steps);
                await runner.close();
                return { name: test.name, success: result.status === 'passed', duration: result.duration };
            } catch (e: any) {
                await runner.close();
                return { name: test.name, success: false, error: e.message };
            }
        } catch (e: any) {
            return { name: test.name, success: false, error: e.message };
        }
    };

    // Process all tests
    for (const test of tests) {
        const result = await runTest(test);
        results.push(result);
    }

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
