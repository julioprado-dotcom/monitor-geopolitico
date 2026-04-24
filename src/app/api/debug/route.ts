import { NextResponse } from 'next/server';

export async function GET() {
  const diagnostics: Record<string, any> = {
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    env: {
      TURSO_DATABASE_URL: process.env.TURSO_DATABASE_URL ? 'SET' : 'MISSING',
      TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN ? 'SET' : 'MISSING',
      DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'MISSING',
      ZAI_BASE_URL: process.env.ZAI_BASE_URL ? 'SET' : 'MISSING',
      ZAI_API_KEY: process.env.ZAI_API_KEY ? 'SET' : 'MISSING',
      ZAI_CHAT_ID: process.env.ZAI_CHAT_ID ? 'SET' : 'MISSING',
      ZAI_USER_ID: process.env.ZAI_USER_ID ? 'SET' : 'MISSING',
      ZAI_TOKEN: process.env.ZAI_TOKEN ? 'SET' : 'MISSING',
    },
  };

  // Test 1: @libsql/client
  try {
    const { createClient } = await import('@libsql/client/web');
    const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || 'file:./test.db';
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (!url || url === 'file:./test.db') {
      diagnostics.libsql = { status: 'SKIPPED', reason: 'No database URL configured' };
    } else {
      const client = createClient({ url, authToken: authToken || '' });
      const result = await client.execute('SELECT 1 as test');
      diagnostics.libsql = { status: 'OK', result: result.rows[0] };
      client.close();
    }
  } catch (error: any) {
    diagnostics.libsql = { status: 'ERROR', message: error.message, stack: error.stack?.slice(0, 500) };
  }

  // Test 2: z-ai-web-dev-sdk
  try {
    const { getZAI } = await import('@/lib/zai');
    const zai = await getZAI();
    const completion = await zai.chat.completions.create({
      messages: [{ role: 'user', content: 'Responde solo: OK' }],
      max_tokens: 5,
    });
    diagnostics.zai = { status: 'OK', response: completion.choices[0]?.message?.content };
  } catch (error: any) {
    diagnostics.zai = { status: 'ERROR', message: error.message, stack: error.stack?.slice(0, 500) };
  }

  return NextResponse.json(diagnostics, { status: 200 });
}
