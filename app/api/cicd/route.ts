
import { NextResponse } from 'next/server';
import { CICDGenerator, CIConfig } from '@/lib/cicd';

export async function POST(req: Request) {
  try {
    const config: CIConfig = await req.json();
    const yaml = CICDGenerator.generate(config);
    return NextResponse.json({ success: true, yaml });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
