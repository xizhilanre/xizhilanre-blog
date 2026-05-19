'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, LogIn, LayoutDashboard, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

const links = [
  { href: '/articles', label: '文章' },
  { href: '/projects', label: '作品' },
  { href: '/about', label: '关于我' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const check = () => setLoggedIn(!!localStorage.getItem('token'));
    check();
    window.addEventListener('focus', check);
    return () => window.removeEventListener('focus', check);
  }, []);

  useEffect(() => {
    setLoggedIn(!!localStorage.getItem('token'));
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    document.cookie = 'token=; path=/; max-age=0';
    setLoggedIn(false);
    router.push('/');
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <header
      className={cn(
        'fixed top-0 inset-x-0 z-50 transition-all duration-300 ease-in-out',
        scrolled
          ? 'glass shadow-lg shadow-black/5'
          : 'bg-transparent',
      )}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="font-serif text-xl font-semibold tracking-tight text-foreground transition-colors hover:text-primary"
        >
          xizhilanre
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'text-sm font-medium transition-all duration-200 hover:text-primary',
                pathname.startsWith(link.href)
                  ? 'text-primary'
                  : 'text-muted-foreground',
              )}
            >
              {link.label}
            </Link>
          ))}
          {loggedIn ? (
            <div className="flex items-center gap-2">
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 rounded-full border border-primary/30 px-4 py-1.5 text-sm font-medium text-primary transition-all duration-300 hover:border-primary/60 hover:shadow-[0_0_20px_rgba(139,125,255,0.15)]"
              >
                <LayoutDashboard size={14} />
                管理后台
              </Link>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-sm font-medium text-muted-foreground transition-all duration-300 hover:border-red-500/30 hover:text-red-400"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-1.5 text-sm font-medium text-foreground/80 transition-all duration-300 hover:border-primary/40 hover:text-primary hover:shadow-[0_0_20px_rgba(139,125,255,0.15)]"
            >
              <LogIn size={14} />
              登录
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="relative z-50 md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile drawer */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-background/80 backdrop-blur-xl transition-all duration-300 md:hidden',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
      >
        <div className="flex h-full flex-col items-center justify-center gap-8">
          {links.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'text-2xl font-serif font-medium transition-all duration-300',
                pathname.startsWith(link.href)
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground',
              )}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              {link.label}
            </Link>
          ))}
          {loggedIn ? (
            <div className="mt-4 flex flex-col items-center gap-4">
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 rounded-full border border-primary/30 px-6 py-2.5 text-lg font-medium text-primary transition-all hover:border-primary/60"
              >
                <LayoutDashboard size={16} />
                管理后台
              </Link>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 px-6 py-2.5 text-lg font-medium text-muted-foreground transition-all hover:border-red-500/30 hover:text-red-400"
              >
                <LogOut size={16} />
                退出登录
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 px-6 py-2.5 text-lg font-medium transition-all hover:border-primary/40 hover:text-primary"
            >
              <LogIn size={16} />
              登录
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
