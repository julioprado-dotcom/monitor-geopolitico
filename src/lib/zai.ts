import ZAI from 'z-ai-web-dev-sdk';

let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null;

export async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create();
  }
  return zaiInstance;
}

export async function chatCompletion(messages: Array<{ role: string; content: string }>) {
  const zai = await getZAI();
  return zai.chat.completions.create({
    messages: messages as Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    temperature: 0.3,
    max_tokens: 4096,
  });
}

export async function webSearch(query: string, num: number = 10) {
  const zai = await getZAI();
  return zai.functions.invoke("web_search", { query, num });
}
