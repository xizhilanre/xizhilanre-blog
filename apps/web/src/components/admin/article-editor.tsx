'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MDEditor from '@uiw/react-md-editor';
import { ArrowLeft, Loader2, Sparkles, Save, Send, ListTree, AlertCircle } from 'lucide-react';
import { createArticle, updateArticle, getArticle, agentSummarize, agentWrite } from '@/lib/api';

interface ArticleEditorProps {
  id?: string;
}

export default function ArticleEditor({ id }: ArticleEditorProps) {
  const router = useRouter();
  const isEdit = !!id;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [summary, setSummary] = useState('');
  const [published, setPublished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingArticle, setLoadingArticle] = useState(isEdit);
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);
  const [aiOutlineLoading, setAiOutlineLoading] = useState(false);
  const [error, setError] = useState('');
  const [aiError, setAiError] = useState('');

  useEffect(() => {
    if (id) {
      getArticle(id)
        .then((res) => {
          const a = res.data;
          setTitle(a.title ?? '');
          setContent(a.content ?? '');
          setTags((a.tags ?? []).join(', '));
          setSummary(a.summary ?? '');
          setPublished(a.published ?? false);
        })
        .catch(() => setError('加载文章失败'))
        .finally(() => setLoadingArticle(false));
    }
  }, [id]);

  const handleSave = async (publish: boolean) => {
    setError('');
    setSaving(true);
    try {
      const tagList = tags
        .split(/[,，]/)
        .map((t) => t.trim())
        .filter(Boolean);

      const payload = { title, content, tags: tagList, summary, published: publish };

      if (isEdit) {
        await updateArticle(id!, payload);
      } else {
        const res = await createArticle(payload);
        const newId = res.data._id;
        router.replace(`/admin/articles/${newId}/edit`);
      }
      setPublished(publish);
    } catch (err: any) {
      setError(err.message ?? '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleAISummary = async () => {
    if (!content.trim()) {
      setAiError('请先输入文章内容');
      return;
    }
    setAiSummaryLoading(true);
    setAiError('');
    try {
      const res = await agentSummarize(content.slice(0, 3000));
      if (res.data?.summary) {
        setSummary(res.data.summary);
      }
    } catch {
      setAiError('AI 功能暂时不可用，请稍后重试');
    } finally {
      setAiSummaryLoading(false);
    }
  };

  const handleAIOutline = async () => {
    if (!title.trim()) {
      setAiError('请先输入文章标题');
      return;
    }
    const keywordList = tags
      .split(/[,，]/)
      .map((t) => t.trim())
      .filter(Boolean);
    setAiOutlineLoading(true);
    setAiError('');
    try {
      const res = await agentWrite(title, keywordList.length > 0 ? keywordList : ['技术']);
      if (res.data?.outline) {
        const insert = `\n\n${res.data.outline}\n\n`;
        setContent((prev) => (prev ? prev + insert : res.data.outline));
      }
    } catch {
      setAiError('AI 功能暂时不可用，请稍后重试');
    } finally {
      setAiOutlineLoading(false);
    }
  };

  if (loadingArticle) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="animate-spin text-muted-foreground" size={32} />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="font-serif text-xl font-bold">
            {isEdit ? '编辑文章' : '新建文章'}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:border-white/20 hover:text-foreground disabled:opacity-50"
          >
            <Save size={15} />
            保存草稿
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/80 disabled:opacity-50"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            {published ? '更新发布' : '发布文章'}
          </button>
        </div>
      </div>

      {error && (
        <p className="mb-4 text-sm text-destructive">{error}</p>
      )}
      {aiError && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-amber-400/20 bg-amber-400/5 px-4 py-2.5 text-sm text-amber-300/80">
          <AlertCircle size={14} />
          {aiError}
        </div>
      )}

      {/* Title + Meta */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="文章标题"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 bg-transparent font-serif text-3xl font-bold text-foreground outline-none placeholder:text-muted-foreground/30"
          />
          <button
            onClick={handleAIOutline}
            disabled={aiOutlineLoading || !title.trim()}
            className="glass-card inline-flex shrink-0 items-center gap-1.5 px-4 py-2.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10 disabled:opacity-50"
            title="AI 生成大纲"
          >
            {aiOutlineLoading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <ListTree size={14} />
            )}
            AI 大纲
          </button>
        </div>
        <div className="flex flex-wrap gap-4">
          <div className="flex-1">
            <label className="mb-1.5 block text-xs text-muted-foreground">标签（逗号分隔）</label>
            <input
              type="text"
              placeholder="React, TypeScript, Frontend"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="glass-card w-full bg-transparent px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground/40"
            />
          </div>
          <div className="min-w-[200px]">
            <label className="mb-1.5 block text-xs text-muted-foreground">摘要</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="文章摘要"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="glass-card flex-1 bg-transparent px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground/40"
              />
              <button
                onClick={handleAISummary}
                disabled={aiSummaryLoading}
                className="glass-card inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-primary transition-colors hover:bg-primary/10 disabled:opacity-50"
                title="AI 生成摘要"
              >
                {aiSummaryLoading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Sparkles size={14} />
                )}
                AI 摘要
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Markdown Editor */}
      <div className="glass-card overflow-hidden" data-color-mode="dark">
        <MDEditor
          value={content}
          onChange={(val) => setContent(val ?? '')}
          height={600}
          preview="live"
          visibleDragbar={false}
        />
      </div>
    </div>
  );
}
