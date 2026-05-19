'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Loader2, ExternalLink, Github, Star } from 'lucide-react';
import { getProjects, createProject, updateProject, deleteProject } from '@/lib/api';

interface ProjectForm {
  _id?: string;
  title: string;
  description: string;
  techStack: string;
  projectLink: string;
  demoLink: string;
  featured: boolean;
}

const emptyForm: ProjectForm = {
  title: '',
  description: '',
  techStack: '',
  projectLink: '',
  demoLink: '',
  featured: false,
};

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ProjectForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState('');

  const fetchProjects = useCallback(() => {
    setLoading(true);
    getProjects()
      .then((res) => setProjects(res.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const openNew = () => {
    setForm(emptyForm);
    setError('');
    setShowForm(true);
  };

  const openEdit = (p: any) => {
    setForm({
      _id: p._id,
      title: p.title ?? '',
      description: p.description ?? '',
      techStack: (p.techStack ?? []).join(', '),
      projectLink: p.projectLink ?? '',
      demoLink: p.demoLink ?? '',
      featured: p.featured ?? false,
    });
    setError('');
    setShowForm(true);
  };

  const handleSave = async () => {
    setError('');
    if (!form.title.trim()) {
      setError('请输入作品名称');
      return;
    }
    setSaving(true);
    try {
      const techStack = form.techStack
        .split(/[,，]/)
        .map((t) => t.trim())
        .filter(Boolean);

      const payload = {
        title: form.title,
        description: form.description,
        techStack,
        projectLink: form.projectLink,
        demoLink: form.demoLink,
        featured: form.featured,
      };

      if (form._id) {
        await updateProject(form._id, payload);
      } else {
        await createProject(payload);
      }
      setShowForm(false);
      fetchProjects();
    } catch (err: any) {
      setError(err.message ?? '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除这个作品吗？')) return;
    setDeleting(id);
    try {
      await deleteProject(id);
      setProjects((prev) => prev.filter((p) => p._id !== id));
    } catch {
      alert('删除失败');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold">作品管理</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            共 {projects.length} 个作品
          </p>
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/80"
        >
          <Plus size={16} />
          新建作品
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="animate-spin text-muted-foreground" size={32} />
        </div>
      ) : (
        <div className="grid gap-4">
          {projects.map((p) => (
            <div key={p._id} className="glass-card flex items-center gap-4 p-4">
              {/* Thumbnail placeholder */}
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-secondary/50 font-serif text-xl text-muted-foreground/30">
                {p.title?.charAt(0) ?? 'P'}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold truncate">{p.title}</h3>
                  {p.featured && (
                    <Star size={14} className="shrink-0 text-amber-400" />
                  )}
                </div>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {p.description}
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {(p.techStack ?? []).slice(0, 5).map((t: string) => (
                    <span key={t} className="rounded-md bg-secondary px-1.5 py-0.5 text-xs text-muted-foreground">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                {p.projectLink && (
                  <a
                    href={p.projectLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    title="GitHub"
                  >
                    <Github size={15} />
                  </a>
                )}
                {p.demoLink && (
                  <a
                    href={p.demoLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    title="在线演示"
                  >
                    <ExternalLink size={15} />
                  </a>
                )}
                <button
                  onClick={() => openEdit(p)}
                  className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  title="编辑"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => handleDelete(p._id)}
                  disabled={deleting === p._id}
                  className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-400"
                  title="删除"
                >
                  {deleting === p._id ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Trash2 size={15} />
                  )}
                </button>
              </div>
            </div>
          ))}
          {projects.length === 0 && (
            <div className="py-16 text-center text-muted-foreground">
              还没有作品，点击右上角新建
            </div>
          )}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 pt-20"
          onClick={() => setShowForm(false)}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-lg animate-fade-in rounded-2xl border border-white/[0.08] bg-card shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-white/[0.06] px-6 py-4">
              <h2 className="font-serif text-lg font-semibold">
                {form._id ? '编辑作品' : '新建作品'}
              </h2>
            </div>

            <div className="space-y-4 p-6">
              <div>
                <label className="mb-1.5 block text-xs text-muted-foreground">作品名称 *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="项目名称"
                  className="glass-card w-full bg-transparent px-3 py-2 text-sm text-foreground outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs text-muted-foreground">描述</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  placeholder="项目简介"
                  className="glass-card w-full bg-transparent px-3 py-2 text-sm text-foreground outline-none resize-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs text-muted-foreground">技术栈（逗号分隔）</label>
                <input
                  type="text"
                  value={form.techStack}
                  onChange={(e) => setForm({ ...form, techStack: e.target.value })}
                  placeholder="React, NestJS, TypeScript"
                  className="glass-card w-full bg-transparent px-3 py-2 text-sm text-foreground outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs text-muted-foreground">GitHub 链接</label>
                  <input
                    type="url"
                    value={form.projectLink}
                    onChange={(e) => setForm({ ...form, projectLink: e.target.value })}
                    placeholder="https://github.com/..."
                    className="glass-card w-full bg-transparent px-3 py-2 text-sm text-foreground outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs text-muted-foreground">演示链接</label>
                  <input
                    type="url"
                    value={form.demoLink}
                    onChange={(e) => setForm({ ...form, demoLink: e.target.value })}
                    placeholder="https://demo..."
                    className="glass-card w-full bg-transparent px-3 py-2 text-sm text-foreground outline-none"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                  className="h-4 w-4 rounded accent-primary"
                />
                <span className="text-muted-foreground">标记为精选项目</span>
              </label>

              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>

            <div className="flex justify-end gap-3 border-t border-white/[0.06] px-6 py-4">
              <button
                onClick={() => setShowForm(false)}
                className="rounded-lg px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/80 disabled:opacity-50"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                {form._id ? '更新' : '创建'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
