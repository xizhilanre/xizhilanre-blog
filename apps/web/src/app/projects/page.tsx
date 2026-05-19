'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ExternalLink, Github, X, Loader2, Tag } from 'lucide-react';
import { getProjects } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { ProjectDoc } from '@/types';

const TECH_OPTIONS = ['React', 'Next.js', 'NestJS', 'TypeScript', 'Python', 'FastAPI', 'MongoDB', 'Node.js'];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTech, setActiveTech] = useState('');
  const [selectedProject, setSelectedProject] = useState<ProjectDoc | null>(null);

  useEffect(() => {
    setLoading(true);
    getProjects(activeTech || undefined)
      .then((res) => setProjects(res.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeTech]);

  const allProjects = projects;

  return (
    <div className="mx-auto max-w-6xl px-6 py-24">
      {/* Page header */}
      <div className="mb-12 text-center">
        <h1 className="font-serif text-4xl font-bold tracking-tight">作品集</h1>
        <p className="mt-3 text-muted-foreground">精选项目与创作</p>
      </div>

      {/* Tech filter pills */}
      <div className="mb-10 flex flex-wrap justify-center gap-3">
        <button
          onClick={() => setActiveTech('')}
          className={cn(
            'rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-300',
            !activeTech
              ? 'bg-primary text-primary-foreground shadow-[0_0_20px_rgba(139,125,255,0.2)]'
              : 'bg-secondary text-muted-foreground hover:text-foreground',
          )}
        >
          全部
        </button>
        {TECH_OPTIONS.map((tech) => (
          <button
            key={tech}
            onClick={() => setActiveTech(activeTech === tech ? '' : tech)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-300',
              activeTech === tech
                ? 'bg-primary text-primary-foreground shadow-[0_0_20px_rgba(139,125,255,0.2)]'
                : 'bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground',
            )}
          >
            <Tag size={12} />
            {tech}
          </button>
        ))}
      </div>

      {/* Project grid */}
      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="animate-spin text-muted-foreground" size={32} />
        </div>
      ) : allProjects.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {allProjects.map((project, i) => (
            <div
              key={project._id}
              className="animate-fade-in"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <ProjectCard
                project={project}
                onClick={() => setSelectedProject(project)}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="py-24 text-center">
          <p className="text-muted-foreground">暂无作品</p>
        </div>
      )}

      {/* Modal */}
      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </div>
  );
}

function ProjectCard({ project, onClick }: { project: ProjectDoc; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="glass-card group relative cursor-pointer overflow-hidden p-6 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:scale-[1.02]"
    >
      {/* Hover glow effect */}
      <div className="pointer-events-none absolute -inset-1 rounded-2xl bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative">
        {/* Media placeholder */}
        <div className="relative mb-4 flex h-36 items-center justify-center overflow-hidden rounded-xl bg-secondary/50 text-4xl">
          {project.media && project.media[0] ? (
            <Image
              src={project.media[0]}
              alt={project.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="rounded-xl object-cover"
            />
          ) : (
            <span className="font-serif text-muted-foreground/30">
              {project.title?.charAt(0) ?? 'P'}
            </span>
          )}
        </div>

        {/* Featured badge */}
        {project.featured && (
          <span className="absolute right-2 top-2 rounded-full bg-primary/90 px-2.5 py-0.5 text-xs font-medium text-primary-foreground">
            精选
          </span>
        )}

        <h3 className="font-serif text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
          {project.title}
        </h3>

        {project.description && (
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
            {project.description}
          </p>
        )}

        {/* Tech stack */}
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
    </div>
  );
}

function ProjectModal({ project, onClose }: { project: ProjectDoc; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal — macOS window feel */}
      <div
        className="relative w-full max-w-2xl animate-fade-in rounded-2xl border border-white/[0.08] bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title bar */}
        <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <button
                onClick={onClose}
                className="h-3 w-3 rounded-full bg-red-500/80 transition-colors hover:bg-red-500"
              />
              <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
              <div className="h-3 w-3 rounded-full bg-green-500/80" />
            </div>
            <span className="ml-4 font-serif text-sm font-semibold text-foreground">
              {project.title}
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[70vh] overflow-y-auto p-6">
          {/* Media */}
          {project.media && project.media[0] && (
            <div className="relative mb-6 h-80 w-full overflow-hidden rounded-xl">
              <Image
                src={project.media[0]}
                alt={project.title}
                fill
                sizes="100vw"
                className="object-cover"
              />
            </div>
          )}

          {project.description && (
            <p className="text-muted-foreground leading-relaxed">
              {project.description}
            </p>
          )}

          {/* Tech stack */}
          {project.techStack && project.techStack.length > 0 && (
            <div className="mt-6">
              <h4 className="mb-3 text-sm font-medium text-foreground">技术栈</h4>
              <div className="flex flex-wrap gap-2">
                {project.techStack.map((tech: string) => (
                  <span
                    key={tech}
                    className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary/80"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Links */}
          <div className="mt-6 flex gap-3">
            {project.projectLink && (
              <a
                href={project.projectLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm transition-all hover:border-primary/40 hover:text-primary"
              >
                <Github size={16} />
                源代码
              </a>
            )}
            {project.demoLink && (
              <a
                href={project.demoLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground transition-all hover:bg-primary/80"
              >
                <ExternalLink size={16} />
                在线演示
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
