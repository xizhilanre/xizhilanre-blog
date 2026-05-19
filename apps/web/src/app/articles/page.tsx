'use client';

import { useState, useRef } from 'react';
import useSWR from 'swr';
import { Search, Loader2, Tag } from 'lucide-react';
import { getArticles } from '@/lib/api';
import ArticleCard from '@/components/home/article-card';
import { cn } from '@/lib/utils';

const ALL_TAGS = [
  'React', 'Next.js', 'TypeScript', 'Node.js', 'NestJS',
  'Python', 'CSS', 'Frontend', 'Backend', 'AI',
];

export default function ArticlesPage() {
  const [activeTag, setActiveTag] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const swrKey = ['articles', page, activeTag || undefined, search || undefined];
  const { data, isLoading } = useSWR(
    swrKey,
    () => getArticles({ page, limit: 9, tag: activeTag || undefined, search: search || undefined }),
    { keepPreviousData: true },
  );

  const articles = data?.data?.items ?? [];
  const totalPages = data?.data?.totalPages ?? 0;

  const handleSearch = (value: string) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
    }, 500);
  };

  const handleTagClick = (tag: string) => {
    setActiveTag(activeTag === tag ? '' : tag);
    setPage(1);
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-24">
      {/* Page header */}
      <div className="mb-12 text-center">
        <h1 className="font-serif text-4xl font-bold tracking-tight">文章</h1>
        <p className="mt-3 text-muted-foreground">技术思考与创作记录</p>
      </div>

      {/* Search */}
      <div className="mx-auto mb-8 max-w-md">
        <div className="glass-card flex items-center gap-3 px-4 py-3 transition-all duration-300 focus-within:border-primary/30 focus-within:shadow-[0_0_30px_rgba(139,125,255,0.08)]">
          <Search size={18} className="text-muted-foreground" />
          <input
            type="text"
            placeholder="搜索文章..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/50"
          />
        </div>
      </div>

      {/* Tag pills */}
      <div className="mb-10 flex flex-wrap justify-center gap-3">
        {ALL_TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => handleTagClick(tag)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-300',
              activeTag === tag
                ? 'bg-primary text-primary-foreground shadow-[0_0_20px_rgba(139,125,255,0.2)]'
                : 'bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground',
            )}
          >
            <Tag size={12} />
            {tag}
          </button>
        ))}
      </div>

      {/* Article grid */}
      {isLoading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="animate-spin text-muted-foreground" size={32} />
        </div>
      ) : articles.length > 0 ? (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article: any, i: number) => (
              <div
                key={article._id}
                className="animate-fade-in"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <ArticleCard article={article} />
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-3">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-all duration-300',
                    p === page
                      ? 'bg-primary text-primary-foreground shadow-[0_0_20px_rgba(139,125,255,0.2)]'
                      : 'bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground',
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="py-24 text-center">
          <p className="text-muted-foreground">
            {activeTag || search ? '没有找到匹配的文章' : '还没有文章'}
          </p>
          {(activeTag || search) && (
            <button
              onClick={() => { setActiveTag(''); setSearch(''); }}
              className="mt-4 text-sm text-primary hover:underline"
            >
              清除筛选
            </button>
          )}
        </div>
      )}
    </div>
  );
}
