import Link from 'next/link';
import { Github, Twitter, Linkedin, Mail } from 'lucide-react';

const socials = [
  { href: 'https://github.com/xizhilanre', icon: Github, label: 'GitHub' },
  { href: 'https://twitter.com', icon: Twitter, label: 'Twitter' },
  { href: 'https://linkedin.com', icon: Linkedin, label: 'LinkedIn' },
  { href: 'mailto:hi@xizhilanre.com', icon: Mail, label: 'Email' },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-background">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex flex-col items-center gap-8">
          {/* Social links */}
          <div className="flex items-center gap-6">
            {socials.map(({ href, icon: Icon, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="text-muted-foreground transition-all duration-300 hover:text-primary hover:scale-110"
              >
                <Icon size={20} />
              </a>
            ))}
          </div>

          {/* Nav links */}
          <div className="flex items-center gap-8">
            <Link
              href="/articles"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              文章
            </Link>
            <Link
              href="/projects"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              作品
            </Link>
            <Link
              href="/about"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              关于我
            </Link>
          </div>

          {/* Copyright */}
          <p className="text-xs text-muted-foreground/60">
            &copy; {new Date().getFullYear()} xizhilanre. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
