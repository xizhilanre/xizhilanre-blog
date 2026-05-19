'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Heart, Eye, Calendar, Clock, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { getArticle, likeArticle, getArticles, agentSummarize, agentRecommend } from '@/lib/api';
import TableOfContents from '@/components/articles/toc';
import { cn } from '@/lib/utils';

function estimateReadTime(content: string): number {
  const words = content.length;
  return Math.max(1, Math.ceil(words / 400));
}

export default function ArticleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [related, setRelated] = useState<any[]>([]);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setAiSummary('');
    setRelated([]);
    getArticle(id)
      .then((res) => {
        setArticle(res.data);
        setLikeCount(res.data?.likeCount ?? 0);

        // AI summary: use stored summary if exists, otherwise call agent
        if (res.data?.summary) {
          setAiSummary(res.data.summary);
        } else if (res.data?.content) {
          setAiSummaryLoading(true);
          agentSummarize(res.data.content.slice(0, 3000))
            .then((r) => {
              if (r.data?.summary) setAiSummary(r.data.summary);
            })
            .catch(() => {})
            .finally(() => setAiSummaryLoading(false));
        }

        // AI recommendations
        const tags = res.data?.tags ?? [];
        if (tags.length > 0) {
          setRelatedLoading(true);
          agentRecommend(id, tags)
            .then((r) => setRelated(r.data?.recommendations ?? []))
            .catch(() => {
              // Fallback: tag-based search
              getArticles({ tag: tags[0], limit: 3 }).then((r2) => {
                setRelated(
                  (r2.data?.items ?? []).filter((a: any) => a._id !== id).slice(0, 3),
                );
              });
            })
            .finally(() => setRelatedLoading(false));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleLike = async () => {
    if (liked) return;
    try {
      const res = await likeArticle(id);
      setLiked(true);
      setLikeCount(res.data?.likeCount ?? likeCount + 1);
    } catch {
      // ignore
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="animate-spin text-muted-foreground" size={32} />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-24 text-center">
        <p className="text-muted-foreground">文章不存在</p>
        <Link href="/articles" className="mt-4 inline-block text-sm text-primary hover:underline">
          返回文章列表
        </Link>
      </div>
    );
  }

  const readTime = estimateReadTime(article.content ?? '');
  const date = article.createdAt
    ? new Date(article.createdAt).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return (
    <div className="mx-auto max-w-6xl px-6 py-24">
      <div className="flex gap-12">
        {/* Main content */}
        <article className="min-w-0 flex-1">
          {/* Back link */}
          <Link
            href="/articles"
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft size={16} />
            返回文章列表
          </Link>

          {/* Article header */}
          <header className="mb-10">
            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {article.tags.map((tag: string) => (
                  <Link
                    key={tag}
                    href={`/articles?tag=${tag}`}
                    className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary/80 transition-colors hover:bg-primary/20"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            )}

            <h1 className="font-serif text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              {article.title}
            </h1>

            <div className="mt-6 flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
              {article.author?.username && (
                <span className="font-medium text-foreground/80">
                  {article.author.username}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <Calendar size={14} />
                {date}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock size={14} />
                阅读约 {readTime} 分钟
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Eye size={14} />
                {article.viewCount ?? 0} 次阅读
              </span>
            </div>
          </header>

          {/* Markdown content */}
          <div className="prose-custom">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                h2: ({ children, ...props }) => {
                  const id = String(children)
                    .toLowerCase()
                    .replace(/\s+/g, '-')
                    .replace(/[^\w-]/g, '');
                  return <h2 id={id} {...props}>{children}</h2>;
                },
                h3: ({ children, ...props }) => {
                  const id = String(children)
                    .toLowerCase()
                    .replace(/\s+/g, '-')
                    .replace(/[^\w-]/g, '');
                  return <h3 id={id} {...props}>{children}</h3>;
                },
              }}
            >
              {article.content}
            </ReactMarkdown>
          </div>

          {/* Like button */}
          <div className="mt-12 flex items-center gap-4 border-t border-white/[0.06] pt-8">
            <button
              onClick={handleLike}
              className={cn(
                'inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300',
                liked
                  ? 'bg-primary/20 text-primary'
                  : 'bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-primary',
              )}
            >
              <Heart
                size={18}
                className={cn(
                  'transition-all duration-300',
                  liked && 'fill-primary scale-110',
                )}
              />
              {likeCount} 赞
            </button>
          </div>

          {/* AI Summary */}
          {(aiSummary || aiSummaryLoading) && (
            <div className="mt-8 rounded-2xl border border-blue-400/20 bg-blue-400/5 p-6">
              <div className="mb-3 flex items-center gap-2">
                <Sparkles size={16} className="text-blue-400" />
                <span className="text-xs font-medium text-blue-400/80">
                  AI 生成摘要
                </span>
              </div>
              {aiSummaryLoading ? (
                <div className="space-y-2">
                  <div className="h-3 w-full animate-pulse rounded-full bg-blue-400/10" />
                  <div className="h-3 w-5/6 animate-pulse rounded-full bg-blue-400/10" />
                  <div className="h-3 w-4/6 animate-pulse rounded-full bg-blue-400/10" />
                </div>
              ) : (
                <p className="text-sm leading-relaxed text-foreground/80">
                  {aiSummary}
                </p>
              )}
            </div>
          )}

          {/* Related articles */}
          {(related.length > 0 || relatedLoading) && (
            <div className="mt-12">
              <h3 className="mb-6 font-serif text-xl font-semibold">相关文章</h3>
              {relatedLoading ? (
                <div className="grid gap-4 sm:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="glass-card p-4">
                      <div className="h-4 w-3/4 animate-pulse rounded-full bg-secondary" />
                      <div className="mt-3 space-y-1.5">
                        <div className="h-2.5 w-full animate-pulse rounded-full bg-secondary" />
                        <div className="h-2.5 w-2/3 animate-pulse rounded-full bg-secondary" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-3">
                  {related.map((a: any) => (
                    <Link key={a.id ?? a._id} href={`/articles/${a.id ?? a._id}`}>
                      <div className="glass-card p-4 transition-all duration-300 hover:-translate-y-1">
                        <h4 className="font-serif text-sm font-semibold line-clamp-2">
                          {a.title}
                        </h4>
                        {a.summary && (
                          <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                            {a.summary}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </article>

        {/* Sidebar TOC */}
        <aside className="hidden w-56 shrink-0 lg:block">
          <div className="sticky top-24">
            {article.content && <TableOfContents content={article.content} />}
          </div>
        </aside>
      </div>
    </div>
  );
}
