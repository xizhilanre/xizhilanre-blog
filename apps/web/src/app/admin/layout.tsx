'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  FolderKanban,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/admin', label: '仪表盘', icon: LayoutDashboard },
  { href: '/admin/articles', label: '文章管理', icon: FileText },
  { href: '/admin/projects', label: '作品管理', icon: FolderKanban },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    document.cookie = 'token=; path=/; max-age=0';
    router.push('/login');
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 border-r border-white/[0.06] bg-card transition-transform duration-300 lg:relative lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-5">
            <Link
              href="/admin"
              className="font-serif text-lg font-semibold tracking-tight"
              onClick={() => setMobileOpen(false)}
            >
              Admin
            </Link>
            <button
              onClick={() => setMobileOpen(false)}
              className="rounded-lg p-1 text-muted-foreground hover:text-foreground lg:hidden"
            >
              <X size={18} />
            </button>
          </div>

          {/* Nav links */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || (href !== '/admin' && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    active
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                  )}
                >
                  <Icon size={18} />
                  {label}
                  {active && (
                    <ChevronRight size={14} className="ml-auto" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Bottom */}
          <div className="border-t border-white/[0.06] px-3 py-4">
            <Link
              href="/"
              className="mb-2 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-all hover:bg-secondary hover:text-foreground"
            >
              <ChevronRight size={18} className="rotate-180" />
              返回网站
            </Link>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-all hover:bg-red-500/10 hover:text-red-400"
            >
              <LogOut size={18} />
              退出登录
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-x-hidden">
        {/* Top bar (mobile) */}
        <div className="flex items-center gap-3 border-b border-white/[0.06] px-6 py-4 lg:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-1 text-muted-foreground hover:text-foreground"
          >
            <Menu size={20} />
          </button>
          <span className="font-serif text-lg font-semibold">Admin</span>
        </div>

        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
