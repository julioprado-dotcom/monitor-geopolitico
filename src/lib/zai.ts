/**
 * ZAI (z.ai / Zhipu AI) API Client
 *
 * Uses the public OpenAI-compatible API at https://api.z.ai/api/paas/v4
 *
 * Required env vars:
 * - ZAI_API_KEY: Your z.ai API key (get it from https://z.ai dashboard)
 *
 * Optional env vars:
 * - ZAI_MODEL: Model to use (default: "glm-4.5-air")
 * - ZAI_BASE_URL: Override base URL (default: "https://api.z.ai/api/paas/v4")
 */

const DEFAULT_BASE_URL = 'https://api.z.ai/api/paas/v4';
const DEFAULT_MODEL = 'glm-4.5-air';

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

/**
 * Chat completion using z.ai's OpenAI-compatible API.
 * Returns the raw API response (OpenAI format).
 *
 * NOTE: No internal retry — the caller (verify route) handles retries
 * to avoid double-retry amplification that wastes rate limit budget.
 */
export async function chatCompletion(
  messages: Array<{ role: string; content: string }>,
  options?: { temperature?: number; max_tokens?: number; model?: string }
) {
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
}

/**
 * Web search using z.ai's function API.
 */
export async function webSearch(query: string, num: number = 10) {
  const baseUrl = getBaseUrl();
  const apiKey = getApiKey();

  try {
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

    if (response.status === 404 || response.status === 400) {
      console.warn('[z-ai] functions/invoke not available');
      return [];
    }

    if (!response.ok) {
      console.warn(`[z-ai] web_search API error ${response.status}`);
      return [];
    }

    const data = await response.json();
    return data;
  } catch {
    return [];
  }
}

/**
 * Check if the ZAI API is configured (no API call — preserves rate limit).
 */
export async function checkZAIStatus(): Promise<{
  configured: boolean;
  model: string;
  baseUrl: string;
}> {
  return {
    configured: !!process.env.ZAI_API_KEY,
    model: getModel(),
    baseUrl: getBaseUrl(),
  };
}
