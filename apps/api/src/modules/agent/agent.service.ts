import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import OpenAI from 'openai';
import { createHash } from 'crypto';
import { Article, ArticleDocument } from '../articles/articles.schema';

@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name);
  private readonly client: OpenAI;
  private readonly summarizeCache = new Map<string, { summary: string; ts: number }>();
  // Rate limit tracking: userId → timestamps[]
  private readonly rateLimitMap = new Map<string, number[]>();

  constructor(
    private readonly config: ConfigService,
    @InjectModel(Article.name) private readonly articleModel: Model<ArticleDocument>,
  ) {
    this.client = new OpenAI({
      apiKey: config.getOrThrow<string>('OPENAI_API_KEY'),
      baseURL: config.get<string>('OPENAI_API_BASE') ?? 'https://api.deepseek.com/v1',
    });
  }

  checkRateLimit(userId: string, maxPerMin = 5): boolean {
    const now = Date.now();
    const window = 60_000;
    const timestamps = this.rateLimitMap.get(userId) ?? [];
    const recent = timestamps.filter((t) => now - t < window);
    if (recent.length >= maxPerMin) return false;
    recent.push(now);
    this.rateLimitMap.set(userId, recent);
    return true;
  }

  // ── Summarize Agent ──────────────────────────────────────

  async summarize(content: string) {
    const hash = this.contentHash(content);
    const cached = this.summarizeCache.get(hash);
    if (cached) {
      this.logger.log(`Summarize cache hit (hash=${hash.slice(0, 8)})`);
      return { summary: cached.summary };
    }

    const response = await this.chat([
      {
        role: 'system',
        content:
          '你是一个博客摘要助手，请用中文生成150字以内的文章摘要，突出文章核心观点。不要包含"本文"、"这篇文章"等废话开头，直接给出摘要内容。',
      },
      { role: 'user', content },
    ]);

    const summary = (response.choices[0]?.message?.content ?? '').trim().slice(0, 200);
    this.summarizeCache.set(hash, { summary, ts: Date.now() });
    this.logTokens('summarize', response);
    return { summary };
  }

  // ── Recommend Agent ──────────────────────────────────────

  async recommend(articleId: string, tags: string[]) {
    // Step 1: Find candidate articles by tag overlap (excluding self)
    const candidates = await this.articleModel
      .find({
        _id: { $ne: articleId },
        published: true,
        tags: { $in: tags },
      })
      .select('title summary tags')
      .limit(10)
      .lean();

    if (candidates.length === 0) return { recommendations: [] };

    // Sort by tag overlap count
    const scored = candidates.map((a) => ({
      ...a,
      _id: a._id.toString(),
      overlap: (a.tags ?? []).filter((t: string) => tags.includes(t)).length,
    }));
    scored.sort((a, b) => b.overlap - a.overlap);
    const top = scored.slice(0, 6);

    try {
      // Step 2: Use AI to rank the top candidates
      const candidateList = top
        .map((a, i) => `${i + 1}. [${a.title}] ${a.summary ?? ''} (tags: ${(a.tags ?? []).join(', ')})`)
        .join('\n');

      const response = await this.chat([
        {
          role: 'system',
          content:
            '你是一个文章推荐系统。根据用户刚读完的文章标签，对候选文章进行相关性评分。返回格式：每行一个编号和分数(1-10)，如 "1:8"',
        },
        {
          role: 'user',
          content: `当前文章标签: [${tags.join(', ')}]\n\n候选文章:\n${candidateList}\n\n请对每篇候选文章评分：`,
        },
      ]);

      const raw = response.choices[0]?.message?.content ?? '';
      const scores = this.parseScores(raw);
      this.logTokens('recommend', response);

      // Merge AI scores with tag overlap
      const merged = top.map((a, i) => ({
        ...a,
        aiScore: scores[i] ?? 5,
        finalScore: a.overlap * 2 + (scores[i] ?? 5),
      }));
      merged.sort((a, b) => b.finalScore - a.finalScore);
      return {
        recommendations: merged.slice(0, 3).map((a) => ({
          id: a._id,
          title: a.title,
          summary: a.summary ?? '',
        })),
      };
    } catch (err) {
      // Fallback: return tag-based results directly
      this.logger.warn(`Recommend AI failed, falling back: ${(err as Error).message}`);
      return {
        recommendations: top.slice(0, 3).map((a) => ({
          id: a._id,
          title: a.title,
          summary: a.summary ?? '',
        })),
      };
    }
  }

  // ── Write Agent ──────────────────────────────────────────

  async write(title: string, keywords: string[], style?: string) {
    const styleHint = style ? `写作风格要求：${style}` : '';
    const response = await this.chat([
      {
        role: 'system',
        content:
          '你是一个专业的技术博客大纲生成助手。根据用户提供的标题和关键词，生成一份Markdown格式的文章大纲，包含3-5个章节标题，每个章节下列出2-3个要点。直接返回大纲内容，不要额外解释。',
      },
      {
        role: 'user',
        content: `文章标题：《${title}》\n关键词：${keywords.join(', ')}\n${styleHint}\n\n请生成文章大纲：`,
      },
    ]);

    const outline = (response.choices[0]?.message?.content ?? '').trim();
    this.logTokens('write', response);
    return { outline };
  }

  // ── Helpers ──────────────────────────────────────────────

  private async chat(messages: OpenAI.ChatCompletionMessageParam[]) {
    return this.client.chat.completions.create({
      model: 'deepseek-chat',
      messages,
      max_tokens: 600,
      temperature: 0.7,
    });
  }

  private contentHash(content: string): string {
    return createHash('md5').update(content, 'utf-8').digest('hex');
  }

  private logTokens(method: string, response: OpenAI.ChatCompletion) {
    const usage = response.usage;
    if (usage) {
      this.logger.log(
        `[${method}] tokens: prompt=${usage.prompt_tokens}, completion=${usage.completion_tokens}, total=${usage.total_tokens}`,
      );
    }
  }

  private parseScores(raw: string): Record<number, number> {
    const scores: Record<number, number> = {};
    const lines = raw.split('\n');
    for (const line of lines) {
      const m = line.match(/(\d+)\s*[:：]\s*(\d+)/);
      if (m) {
        const idx = parseInt(m[1], 10) - 1;
        const score = parseInt(m[2], 10);
        if (idx >= 0 && score >= 1 && score <= 10) {
          scores[idx] = score;
        }
      }
    }
    return scores;
  }
}
