'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import Hero from '@/components/home/hero';
import ArticleCard from '@/components/home/article-card';
import { getArticles, getProjects } from '@/lib/api';
import type { ArticleDoc, ProjectDoc } from '@/types';

export default function HomePage() {
  const [articles, setArticles] = useState<ArticleDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [projects, setProjects] = useState<ProjectDoc[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);

  const fetchArticles = useCallback(async (p: number) => {
    try {
      const res = await getArticles({ page: p, limit: 6 });
      const items = res.data?.items ?? [];
      const totalPages = res.data?.totalPages ?? 1;
      if (p === 1) {
        setArticles(items);
      } else {
        setArticles((prev) => [...prev, ...items]);
      }
      setHasMore(p < totalPages);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchArticles(1);
  }, [fetchArticles]);

  useEffect(() => {
    getProjects()
      .then((res) => setProjects((res.data ?? []).filter((p: ProjectDoc) => p.featured)))
      .catch(() => {})
      .finally(() => setProjectsLoading(false));
  }, []);

  const loadMore = () => {
    setLoadingMore(true);
    const next = page + 1;
    setPage(next);
    fetchArticles(next);
  };

  // Infinite scroll
  useEffect(() => {
    const onScroll = () => {
      if (loadingMore || !hasMore) return;
      const nearBottom =
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 600;
      if (nearBottom) loadMore();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [loadingMore, hasMore, page]);

  const featured = articles.slice(0, 3);
  const latest = articles;

  return (
    <div>
      <Hero />

      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="animate-spin text-muted-foreground" size={32} />
        </div>
      ) : (
        <>
          {/* Featured articles */}
          {featured.length > 0 && (
            <section className="mx-auto max-w-6xl px-6 pb-8">
              <div className="mb-8 flex items-center gap-3">
                <div className="h-4 w-1 rounded-full bg-primary" />
                <h2 className="font-serif text-2xl font-semibold">精选文章</h2>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {featured.map((article) => (
                  <ArticleCard key={article._id} article={article} />
                ))}
              </div>
            </section>
          )}

          {/* Latest articles */}
          {latest.length > 0 && (
            <section className="mx-auto max-w-6xl px-6 pb-24">
              <div className="mb-8 flex items-center gap-3">
                <div className="h-4 w-1 rounded-full bg-primary" />
                <h2 className="font-serif text-2xl font-semibold">最新文章</h2>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {latest.map((article) => (
                  <ArticleCard key={article._id} article={article} />
                ))}
              </div>

              {/* Load more indicator */}
              {loadingMore && (
                <div className="mt-12 flex justify-center">
                  <Loader2 className="animate-spin text-muted-foreground" size={24} />
                </div>
              )}

              {!hasMore && latest.length > 6 && (
                <p className="mt-12 text-center text-sm text-muted-foreground">
                  已加载全部文章
                </p>
              )}

              {/* Manual load more button (fallback) */}
              {hasMore && !loadingMore && (
                <div className="mt-12 flex justify-center">
                  <button
                    onClick={loadMore}
                    className="rounded-full border border-white/10 px-6 py-2.5 text-sm text-muted-foreground transition-all duration-300 hover:border-primary/40 hover:text-primary"
                  >
                    加载更多
                  </button>
                </div>
              )}
            </section>
          )}

          {/* Featured projects */}
          {!projectsLoading && projects.length > 0 && (
            <section className="mx-auto max-w-6xl px-6 pb-16">
              <div className="mb-8 flex items-center gap-3">
                <div className="h-4 w-1 rounded-full bg-primary" />
                <h2 className="font-serif text-2xl font-semibold">精选项目</h2>
                <Link
                  href="/projects"
                  className="ml-auto text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  查看全部 →
                </Link>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => (
                  <Link
                    key={project._id}
                    href={`/projects?id=${project._id}`}
                    className="glass-card group relative overflow-hidden p-6 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:scale-[1.02]"
                  >
                    <div className="pointer-events-none absolute -inset-1 rounded-2xl bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <div className="relative">
                      <div className="mb-4 flex h-32 items-center justify-center rounded-xl bg-secondary/50 font-serif text-3xl text-muted-foreground/30">
                        {project.title?.charAt(0) ?? 'P'}
                      </div>
                      <h3 className="font-serif text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
                        {project.title}
                      </h3>
                      {project.description && (
                        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                          {project.description}
                        </p>
                      )}
                      {project.techStack && project.techStack.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {project.techStack.slice(0, 4).map((tech: string) => (
                            <span
                              key={tech}
                              className="rounded-md bg-secondary px-2 py-0.5 text-xs text-muted-foreground"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Empty state */}
          {articles.length === 0 && (
            <section className="mx-auto max-w-6xl px-6 pb-24 text-center">
              <p className="text-muted-foreground">还没有文章，敬请期待。</p>
            </section>
          )}
        </>
      )}
    </div>
  );
}
