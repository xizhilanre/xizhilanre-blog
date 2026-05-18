import OpenAI from 'openai';

/** DeepSeek AI 客户端（兼容 OpenAI SDK） */
export function createAIClient(): OpenAI {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY ?? '',
    baseURL: process.env.OPENAI_API_BASE ?? 'https://api.deepseek.com/v1',
  });
}

/** 调用 DeepSeek 聊天模型 */
export async function chat(
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
  options?: { temperature?: number; maxTokens?: number },
): Promise<string> {
  const client = createAIClient();
  const response = await client.chat.completions.create({
    model: 'deepseek-chat',
    messages,
    temperature: options?.temperature ?? 0.7,
    max_tokens: options?.maxTokens ?? 1024,
  });
  return response.choices[0]?.message?.content ?? '';
}

/** 从文本中提取摘要（≤150 字） */
export async function summarize(text: string): Promise<string> {
  return chat([
    { role: 'system', content: '你是一个文本摘要助手。请将以下内容总结为150字以内的中文摘要。' },
    { role: 'user', content: text },
  ]);
}
