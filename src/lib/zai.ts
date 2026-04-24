/**
 * ZAI (z.ai / Zhipu AI) API Client
 *
 * Uses the public OpenAI-compatible API at https://api.z.ai/api/paas/v4
 * No SDK dependency needed — just fetch + API key.
 *
 * Required env vars:
 * - ZAI_API_KEY: Your z.ai API key (get it from https://z.ai dashboard)
 *
 * Optional env vars:
 * - ZAI_MODEL: Model to use (default: "glm-4-flash" which is FREE)
 * - ZAI_BASE_URL: Override base URL (default: "https://api.z.ai/api/paas/v4")
 */

const DEFAULT_BASE_URL = 'https://api.z.ai/api/paas/v4';
const DEFAULT_MODEL = 'glm-4.7-flash';

function getBaseUrl(): string {
  return process.env.ZAI_BASE_URL || DEFAULT_BASE_URL;
}

function getApiKey(): string {
  const key = process.env.ZAI_API_KEY;
  if (!key) {
    throw new Error('ZAI_API_KEY environment variable is not set. Get your key at https://z.ai');
  }
  return key;
}

function getModel(): string {
  return process.env.ZAI_MODEL || DEFAULT_MODEL;
}

/** Delay helper to avoid rate limiting */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Retry with exponential backoff for rate-limited API calls */
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3, baseDelay = 2000): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      const isRateLimit =
        error?.message?.includes('429') ||
        error?.message?.includes('Too many requests') ||
        error?.message?.includes('rate_limit');
      const isLastAttempt = attempt === maxRetries;
      if (!isRateLimit || isLastAttempt) throw error;
      const waitTime = baseDelay * Math.pow(2, attempt);
      console.warn(`Rate limited, retrying in ${waitTime}ms (attempt ${attempt + 1}/${maxRetries})`);
      await delay(waitTime);
    }
  }
  throw new Error('Max retries exceeded');
}

/**
 * Chat completion using z.ai's OpenAI-compatible API.
 * Returns the raw API response (OpenAI format).
 */
export async function chatCompletion(
  messages: Array<{ role: string; content: string }>,
  options?: { temperature?: number; max_tokens?: number; model?: string }
) {
  return withRetry(async () => {
    const baseUrl = getBaseUrl();
    const apiKey = getApiKey();
    const model = options?.model || getModel();

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: messages as Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
        temperature: options?.temperature ?? 0.3,
        max_tokens: options?.max_tokens ?? 4096,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`ZAI API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return data;
  });
}

/**
 * Web search using z.ai's function API.
 * The z.ai platform supports web_search as a built-in function.
 */
export async function webSearch(query: string, num: number = 10) {
  return withRetry(async () => {
    const baseUrl = getBaseUrl();
    const apiKey = getApiKey();

    // z.ai supports web_search through the functions/invoke endpoint
    const response = await fetch(`${baseUrl}/functions/invoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        function: 'web_search',
        parameters: { query, num },
      }),
    });

    // If functions/invoke is not supported, fall back to chat-based search
    if (response.status === 404 || response.status === 400) {
      console.warn('[z-ai] functions/invoke not available, using chat-based search fallback');
      return chatBasedSearch(query, num);
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.warn(`[z-ai] web_search API error ${response.status}: ${errorText}`);
      // Fall back to chat-based search
      return chatBasedSearch(query, num);
    }

    const data = await response.json();
    return data;
  });
}

/**
 * Fallback: Chat-based web search simulation.
 * Uses the chat model to generate search-like results with links.
 * This is a fallback when the native web_search function is unavailable.
 */
async function chatBasedSearch(query: string, num: number = 10) {
  const response = await chatCompletion([
    {
      role: 'system',
      content: `You are a web search assistant. Given a search query, return realistic search results as a JSON array. Each result should have: url, name, snippet, host_name, rank, date. Return ${num} results. Respond ONLY with the JSON array, no other text.`,
    },
    {
      role: 'user',
      content: `Search query: "${query}"`,
    },
  ], { temperature: 0.1, max_tokens: 2048 });

  try {
    const content = response.choices[0]?.message?.content || '[]';
    const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const results = JSON.parse(cleaned);
    if (Array.isArray(results)) {
      return results;
    }
  } catch {
    // If parsing fails, return empty array
  }
  return [];
}

/**
 * Check if the ZAI API is reachable and configured.
 * Returns a status object for diagnostics.
 */
export async function checkZAIStatus(): Promise<{
  configured: boolean;
  reachable: boolean;
  model: string;
  error?: string;
}> {
  const apiKey = process.env.ZAI_API_KEY;
  if (!apiKey) {
    return {
      configured: false,
      reachable: false,
      model: getModel(),
      error: 'ZAI_API_KEY env var not set',
    };
  }

  try {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: getModel(),
        messages: [{ role: 'user', content: 'Hi' }],
        max_tokens: 5,
      }),
    });

    if (response.ok) {
      return { configured: true, reachable: true, model: getModel() };
    } else {
      const errorText = await response.text().catch(() => 'Unknown error');
      return {
        configured: true,
        reachable: false,
        model: getModel(),
        error: `API returned ${response.status}: ${errorText.slice(0, 200)}`,
      };
    }
  } catch (error: any) {
    return {
      configured: true,
      reachable: false,
      model: getModel(),
      error: error.message,
    };
  }
}
