
import { NextResponse } from 'next/server';
import { runManager } from '@/lib/run-manager';

export async function POST(req: Request) {
  try {
    const { all = false } = await req.json().catch(() => ({}));
    
    if (all) {
        await runManager.stopAll();
        return NextResponse.json({ success: true, message: 'All active tests stopped' });
    }

    // For now, we mainly support stopping all or the current active one via run-manager
    // Specific runId support can be added if we tracked it in the UI
    await runManager.stopAll(); 
    return NextResponse.json({ success: true, message: 'Tests stopped successfully' });

  } catch (error: any) {
    console.error('Stop Test Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
