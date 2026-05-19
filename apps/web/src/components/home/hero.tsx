import { Github, Twitter, Linkedin, ArrowDown } from 'lucide-react';
import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative flex min-h-[90vh] flex-col items-center justify-center px-6 text-center">
      {/* Subtle background glow */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/3 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[120px]" />
      </div>

      {/* Avatar */}
      <div className="mb-8 h-24 w-24 overflow-hidden rounded-full border-2 border-white/10 bg-secondary ring-2 ring-primary/20">
        <div className="flex h-full w-full items-center justify-center font-serif text-3xl text-muted-foreground">
          X
        </div>
      </div>

      {/* Heading */}
      <h1 className="max-w-3xl font-serif text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
        <span className="text-foreground">你好，我是</span>{' '}
        <span className="accent-gradient">xizhilanre</span>
      </h1>

      {/* Tagline */}
      <p className="mt-6 max-w-xl text-balance text-lg text-muted-foreground">
        全栈开发者，热爱构建优雅的 Web 体验。专注于 React、Next.js 与 Node.js
        生态，用代码将创意变为现实。
      </p>

      {/* Social icons */}
      <div className="mt-8 flex items-center gap-5">
        {[
          { href: 'https://github.com/xizhilanre', icon: Github, label: 'GitHub' },
          { href: 'https://twitter.com', icon: Twitter, label: 'Twitter' },
          { href: 'https://linkedin.com', icon: Linkedin, label: 'LinkedIn' },
        ].map(({ href, icon: Icon, label }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className="text-muted-foreground transition-all duration-300 hover:scale-110 hover:text-primary"
          >
            <Icon size={22} />
          </a>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-12 flex items-center gap-4">
        <Link
          href="/articles"
          className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-all duration-300 hover:bg-primary/80 hover:shadow-[0_0_30px_rgba(139,125,255,0.3)]"
        >
          阅读文章
        </Link>
        <Link
          href="/projects"
          className="rounded-full border border-white/10 px-6 py-2.5 text-sm font-medium text-foreground/80 transition-all duration-300 hover:border-primary/40 hover:text-primary"
        >
          查看作品
        </Link>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 animate-bounce text-muted-foreground/30">
        <ArrowDown size={20} />
      </div>
    </section>
  );
}
