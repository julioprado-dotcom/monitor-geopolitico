import { NextResponse } from 'next/server';
import { demoThreads } from '@/data/threads';

export async function GET() {
  return NextResponse.json({
    threads: demoThreads,
    total: demoThreads.length,
  });
}
