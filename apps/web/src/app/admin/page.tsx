'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, FolderKanban, Eye, ThumbsUp, Plus } from 'lucide-react';
import { getArticles, getProjects } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { ArticleDoc } from '@/types';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ articles: 0, projects: 0, views: 0, likes: 0 });
  const [recentArticles, setRecentArticles] = useState<ArticleDoc[]>([]);

  useEffect(() => {
    Promise.all([getArticles({ limit: 5 }), getProjects()])
      .then(([aRes, pRes]) => {
        const items = aRes.data?.items ?? [];
        const totalViews = items.reduce((s: number, a: ArticleDoc) => s + (a.viewCount ?? 0), 0);
        const totalLikes = items.reduce((s: number, a: ArticleDoc) => s + (a.likeCount ?? 0), 0);
        setStats({
          articles: aRes.data?.total ?? items.length,
          projects: (pRes.data ?? []).length,
          views: totalViews,
          likes: totalLikes,
        });
        setRecentArticles(items);
      })
      .catch(() => {});
  }, []);

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold">仪表盘</h1>
          <p className="mt-1 text-sm text-muted-foreground">博客数据概览</p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: '文章总数', value: stats.articles, icon: FileText, color: 'text-blue-400', bg: 'bg-blue-400/10' },
          { label: '作品总数', value: stats.projects, icon: FolderKanban, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
          { label: '总阅读量', value: stats.views, icon: Eye, color: 'text-violet-400', bg: 'bg-violet-400/10' },
          { label: '总点赞', value: stats.likes, icon: ThumbsUp, color: 'text-amber-400', bg: 'bg-amber-400/10' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="glass-card p-5">
            <div className="flex items-center gap-3">
              <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', bg)}>
                <Icon size={20} className={color} />
              </div>
              <div>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent articles */}
      <div className="glass-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
          <h2 className="font-serif text-lg font-semibold">最近文章</h2>
          <Link
            href="/admin/articles/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-all hover:bg-primary/80"
          >
            <Plus size={14} />
            新建
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.04] text-left text-xs text-muted-foreground">
                <th className="px-6 py-3 font-medium">标题</th>
                <th className="px-6 py-3 font-medium">状态</th>
                <th className="px-6 py-3 font-medium">阅读</th>
                <th className="px-6 py-3 font-medium">点赞</th>
                <th className="px-6 py-3 font-medium">日期</th>
              </tr>
            </thead>
            <tbody>
              {recentArticles.map((a) => (
                <tr key={a._id} className="border-b border-white/[0.02] hover:bg-secondary/30">
                  <td className="px-6 py-3">
                    <Link href={`/admin/articles/${a._id}/edit`} className="font-medium hover:text-primary">
                      {a.title}
                    </Link>
                  </td>
                  <td className="px-6 py-3">
                    <span className={cn(
                      'rounded-full px-2 py-0.5 text-xs',
                      a.published ? 'bg-emerald-400/10 text-emerald-400' : 'bg-amber-400/10 text-amber-400',
                    )}>
                      {a.published ? '已发布' : '草稿'}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-muted-foreground">{a.viewCount ?? 0}</td>
                  <td className="px-6 py-3 text-muted-foreground">{a.likeCount ?? 0}</td>
                  <td className="px-6 py-3 text-muted-foreground">
                    {new Date(a.createdAt).toLocaleDateString('zh-CN')}
                  </td>
                </tr>
              ))}
              {recentArticles.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    还没有文章
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
