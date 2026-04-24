import ZAI from 'z-ai-web-dev-sdk';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null;

/**
 * Ensure .z-ai-config exists. On EdgeOne/production, we generate it
 * from environment variables at runtime. On local dev, it may already
 * exist in /etc/ or the project root.
 */
function ensureConfig() {
  const cwdConfig = join(process.cwd(), '.z-ai-config');

  // If config already exists, nothing to do
  if (existsSync(cwdConfig)) return;

  // Build config from environment variables
  const baseUrl = process.env.ZAI_BASE_URL;
  const apiKey = process.env.ZAI_API_KEY;

  if (!baseUrl || !apiKey) {
    console.warn(
      '[z-ai] No .z-ai-config found and ZAI_BASE_URL/ZAI_API_KEY env vars not set. ' +
      'The SDK will look for config in home dir or /etc/.'
    );
    return;
  }

  const config = {
    baseUrl,
    apiKey,
    chatId: process.env.ZAI_CHAT_ID || '',
    userId: process.env.ZAI_USER_ID || '',
    token: process.env.ZAI_TOKEN || '',
  };

  try {
    writeFileSync(cwdConfig, JSON.stringify(config), 'utf-8');
    console.log('[z-ai] Generated .z-ai-config from environment variables');
  } catch (err) {
    console.error('[z-ai] Failed to write .z-ai-config:', err);
  }
}

export async function getZAI() {
  if (!zaiInstance) {
    ensureConfig();
    zaiInstance = await ZAI.create();
  }
  return zaiInstance;
}

/** Delay helper to avoid rate limiting */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Retry with exponential backoff for rate-limited SDK calls */
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3, baseDelay = 2000): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      const isRateLimit = error?.message?.includes('429') || error?.message?.includes('Too many requests');
      const isLastAttempt = attempt === maxRetries;
      if (!isRateLimit || isLastAttempt) throw error;
      const waitTime = baseDelay * Math.pow(2, attempt);
      console.warn(`Rate limited, retrying in ${waitTime}ms (attempt ${attempt + 1}/${maxRetries})`);
      await delay(waitTime);
    }
  }
  throw new Error('Max retries exceeded');
}

export async function chatCompletion(messages: Array<{ role: string; content: string }>) {
  return withRetry(async () => {
    const zai = await getZAI();
    return zai.chat.completions.create({
      messages: messages as Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
      temperature: 0.3,
      max_tokens: 4096,
    });
  });
}

export async function webSearch(query: string, num: number = 10) {
  return withRetry(async () => {
    const zai = await getZAI();
    return zai.functions.invoke("web_search", { query, num });
  });
}
