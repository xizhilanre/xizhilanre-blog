'use client';

import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import Link from 'next/link';
import { Plus, Pencil, Trash2, Eye, Loader2 } from 'lucide-react';
import { getArticles, deleteArticle, updateArticle } from '@/lib/api';
import { cn } from '@/lib/utils';

const SWR_KEY = 'admin-articles';

export default function AdminArticlesPage() {
  const { data, isLoading } = useSWR(SWR_KEY, () => getArticles({ limit: 100 }));
  const [deleting, setDeleting] = useState<string | null>(null);

  const articles = data?.data?.items ?? [];

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除这篇文章吗？')) return;
    setDeleting(id);
    try {
      await deleteArticle(id);
      mutate(SWR_KEY);
    } catch {
      alert('删除失败');
    } finally {
      setDeleting(null);
    }
  };

  const handleTogglePublish = async (id: string, published: boolean) => {
    try {
      await updateArticle(id, { published: !published });
      mutate(SWR_KEY);
    } catch {
      alert('操作失败');
    }
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold">文章管理</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            共 {articles.length} 篇文章
          </p>
        </div>
        <Link
          href="/admin/articles/new"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/80"
        >
          <Plus size={16} />
          新建文章
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="animate-spin text-muted-foreground" size={32} />
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-left text-xs text-muted-foreground">
                  <th className="px-6 py-4 font-medium">标题</th>
                  <th className="px-6 py-4 font-medium">标签</th>
                  <th className="px-6 py-4 font-medium">状态</th>
                  <th className="px-6 py-4 font-medium">日期</th>
                  <th className="px-6 py-4 font-medium text-right">操作</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((a: any) => (
                  <tr key={a._id} className="border-b border-white/[0.02] hover:bg-secondary/30">
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/articles/${a._id}/edit`}
                        className="font-medium hover:text-primary"
                      >
                        {a.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {(a.tags ?? []).slice(0, 3).map((t: string) => (
                          <span
                            key={t}
                            className="rounded-md bg-secondary px-1.5 py-0.5 text-xs text-muted-foreground"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleTogglePublish(a._id, a.published)}
                        className={cn(
                          'rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
                          a.published
                            ? 'bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/20'
                            : 'bg-amber-400/10 text-amber-400 hover:bg-amber-400/20',
                        )}
                      >
                        {a.published ? '已发布' : '草稿'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(a.createdAt).toLocaleDateString('zh-CN')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <a
                          href={`/articles/${a._id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                          title="查看"
                        >
                          <Eye size={15} />
                        </a>
                        <Link
                          href={`/admin/articles/${a._id}/edit`}
                          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                          title="编辑"
                        >
                          <Pencil size={15} />
                        </Link>
                        <button
                          onClick={() => handleDelete(a._id)}
                          disabled={deleting === a._id}
                          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-400"
                          title="删除"
                        >
                          {deleting === a._id ? (
                            <Loader2 size={15} className="animate-spin" />
                          ) : (
                            <Trash2 size={15} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {articles.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-muted-foreground">
                      还没有文章，点击右上角新建
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
