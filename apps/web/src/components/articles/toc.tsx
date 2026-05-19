'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export default function TableOfContents({ content }: { content: string }) {
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    // Parse headings from markdown
    const lines = content.split('\n');
    const items: TocItem[] = [];
    lines.forEach((line) => {
      const match = line.match(/^(#{1,3})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2].replace(/[`*_~[\]()]/g, '');
        const id = text
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^\w-]/g, '');
        items.push({ id, text, level });
      }
    });
    setHeadings(items);
  }, [content]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-80px 0px -80% 0px' },
    );

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav className="text-sm">
      <h4 className="mb-4 font-serif text-base font-semibold text-foreground">
        目录
      </h4>
      <ul className="space-y-2 border-l border-white/[0.08]">
        {headings.map(({ id, text, level }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              className={cn(
                'block py-1 transition-all duration-200 hover:text-primary',
                level === 2 ? 'pl-4' : level === 3 ? 'pl-7' : '',
                activeId === id
                  ? 'border-l-2 border-primary -ml-[1px] pl-[calc(1rem-1px)] text-primary font-medium'
                  : 'text-muted-foreground',
              )}
              style={
                activeId === id && level === 3
                  ? { paddingLeft: 'calc(1.75rem - 1px)' }
                  : {}
              }
            >
              {text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
