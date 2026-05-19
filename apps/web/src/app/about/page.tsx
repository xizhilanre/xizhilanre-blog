'use client';

import {
  FileText,
  Code2,
  Server,
  Wrench,
  Briefcase,
  GraduationCap,
  MapPin,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const skills = [
  {
    category: '前端',
    icon: Code2,
    items: [
      { name: 'React / Next.js', level: 90 },
      { name: 'TypeScript', level: 85 },
      { name: 'TailwindCSS', level: 88 },
      { name: 'Framer Motion', level: 70 },
    ],
  },
  {
    category: '后端',
    icon: Server,
    items: [
      { name: 'Node.js / NestJS', level: 85 },
      { name: 'Python / FastAPI', level: 75 },
      { name: 'MongoDB / PostgreSQL', level: 80 },
      { name: 'GraphQL / REST', level: 78 },
    ],
  },
  {
    category: '工具',
    icon: Wrench,
    items: [
      { name: 'Git / GitHub', level: 90 },
      { name: 'Docker', level: 72 },
      { name: 'Figma', level: 65 },
      { name: 'CI/CD', level: 75 },
    ],
  },
];

const experiences = [
  {
    type: 'work',
    title: '全栈开发工程师',
    org: '某科技公司',
    period: '2022 - 至今',
    location: '远程',
    description: '负责核心产品的前后端开发，使用 React + NestJS 技术栈，优化页面性能与用户体验。',
  },
  {
    type: 'work',
    title: '前端开发实习生',
    org: '某互联网公司',
    period: '2021 - 2022',
    location: '北京',
    description: '参与企业级后台管理系统开发，学习并实践 React 生态与工程化实践。',
  },
  {
    type: 'edu',
    title: '计算机科学与技术 本科',
    org: '某大学',
    period: '2019 - 2023',
    location: '',
    description: '主修数据结构、算法、操作系统、计算机网络等课程，参与多个校园技术项目。',
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-24">
      {/* Page header */}
      <div className="mb-16 text-center">
        <h1 className="font-serif text-4xl font-bold tracking-tight">关于我</h1>
        <p className="mt-3 text-muted-foreground">关于技术、创作与成长</p>
      </div>

      {/* Intro */}
      <section className="mb-20">
        <div className="glass-card p-8">
          <p className="leading-relaxed text-muted-foreground">
            你好，我是 xizhilanre，一名热爱构建优雅 Web 体验的全栈开发者。
            我相信好的代码不仅是功能的实现，更是一种表达。
          </p>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            我专注于 React、Next.js 与 NestJS 生态，热衷于探索前后端一体化架构、
            性能优化与 AI 驱动的开发体验。工作之余，我喜欢写技术博客分享心得，
            也乐于参与开源社区的建设。
          </p>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            目前我正在寻找远程工作机会，如果你对我的技能感兴趣，欢迎联系。
          </p>
        </div>
      </section>

      {/* Skills */}
      <section className="mb-20">
        <h2 className="mb-8 font-serif text-2xl font-semibold">技能图谱</h2>
        <div className="grid gap-8 sm:grid-cols-3">
          {skills.map(({ category, icon: Icon, items }) => (
            <div key={category} className="glass-card p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Icon size={20} className="text-primary" />
                </div>
                <h3 className="font-serif text-lg font-semibold">{category}</h3>
              </div>
              <div className="space-y-4">
                {items.map(({ name, level }) => (
                  <div key={name}>
                    <div className="mb-1.5 flex justify-between text-xs">
                      <span className="text-muted-foreground">{name}</span>
                      <span className="font-mono text-muted-foreground/60">
                        {level}%
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary/60 to-primary transition-all duration-700 ease-out"
                        style={{ width: `${level}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Experience Timeline */}
      <section className="mb-20">
        <h2 className="mb-8 font-serif text-2xl font-semibold">经历</h2>
        <div className="relative">
          {/* Dashed vertical line */}
          <div className="absolute left-5 top-2 bottom-2 w-px border-l border-dashed border-white/[0.12]" />

          <div className="space-y-8">
            {experiences.map((exp, i) => (
              <div key={i} className="relative flex gap-5 pl-2">
                {/* Dot */}
                <div
                  className={cn(
                    'relative z-10 mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2',
                    exp.type === 'work'
                      ? 'border-primary/40 bg-primary/10'
                      : 'border-emerald-500/40 bg-emerald-500/10',
                  )}
                >
                  {exp.type === 'work' ? (
                    <Briefcase size={14} className="text-primary" />
                  ) : (
                    <GraduationCap size={14} className="text-emerald-400" />
                  )}
                </div>

                <div className="glass-card flex-1 p-5">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-semibold text-foreground">
                      {exp.title}
                    </span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-primary/80">{exp.org}</span>
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground/60">
                    <span className="inline-flex items-center gap-1">
                      <Calendar size={11} />
                      {exp.period}
                    </span>
                    {exp.location && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={11} />
                        {exp.location}
                      </span>
                    )}
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                    {exp.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Resume Section */}
      <section>
        <h2 className="mb-8 font-serif text-2xl font-semibold">简历</h2>

        <div className="glass-card p-8">
          {/* Resume header */}
          <div className="text-center mb-8">
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <FileText size={32} className="text-primary" />
              </div>
            </div>
            <h3 className="font-serif text-2xl font-bold">xizhilanre</h3>
            <p className="mt-1 text-muted-foreground">全栈开发工程师</p>
            <div className="mt-3 flex justify-center gap-4 text-xs text-muted-foreground">
              <span>hi@xizhilanre.com</span>
              <span>github.com/xizhilanre</span>
            </div>
          </div>

          {/* Skills summary */}
          <h4 className="mb-3 border-b border-white/[0.06] pb-2 font-serif text-lg font-semibold">
            技能概览
          </h4>
          <div className="mb-8 grid grid-cols-3 gap-4">
            {skills.map(({ category, items }) => (
              <div key={category}>
                <h5 className="mb-2 text-sm font-medium text-primary/80">
                  {category}
                </h5>
                <ul className="space-y-1">
                  {items.map(({ name }) => (
                    <li key={name} className="text-xs text-muted-foreground">
                      {name}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Experience summary */}
          <h4 className="mb-3 border-b border-white/[0.06] pb-2 font-serif text-lg font-semibold">
            工作经历
          </h4>
          <div className="space-y-4">
            {experiences.map((exp, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{exp.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {exp.period}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {exp.org}{exp.location ? ` · ${exp.location}` : ''}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {exp.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
