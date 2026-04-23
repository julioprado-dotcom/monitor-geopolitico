import ZAI from 'z-ai-web-dev-sdk';

let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null;

export async function getZAI() {
  if (!zaiInstance) {
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
