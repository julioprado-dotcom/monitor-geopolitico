import { NextResponse } from 'next/server';
import { demoAnalysis } from '@/data/analysis';

export async function GET() {
  return NextResponse.json({
    analysis: demoAnalysis,
    total: demoAnalysis.length,
  });
}
