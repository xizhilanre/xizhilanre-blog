import Link from 'next/link';
import { Calendar, Eye } from 'lucide-react';

interface ArticleCardProps {
  article: {
    _id: string;
    title: string;
    summary?: string;
    tags?: string[];
    viewCount?: number;
    likeCount?: number;
    createdAt?: string;
    author?: { username?: string; avatar?: string };
  };
}

export default function ArticleCard({ article }: ArticleCardProps) {
  const date = article.createdAt
    ? new Date(article.createdAt).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return (
    <Link href={`/articles/${article._id}`}>
      <article className="glass-card group cursor-pointer p-6 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:scale-[1.02]">
        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {article.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary/80"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h3 className="font-serif text-xl font-semibold text-foreground transition-colors group-hover:text-primary">
          {article.title}
        </h3>

        {/* Summary */}
        {article.summary && (
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
            {article.summary}
          </p>
        )}

        {/* Meta */}
        <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground/60">
          {article.author?.username && (
            <span>{article.author.username}</span>
          )}
          {date && (
            <span className="inline-flex items-center gap-1">
              <Calendar size={12} />
              {date}
            </span>
          )}
          {article.viewCount !== undefined && (
            <span className="inline-flex items-center gap-1">
              <Eye size={12} />
              {article.viewCount}
            </span>
          )}
        </div>
      </article>
    </Link>
  );
}
