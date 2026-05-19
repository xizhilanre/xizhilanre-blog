'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Loader2, ArrowLeft } from 'lucide-react';
import { login } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login({ email, password });
      localStorage.setItem('token', res.data.token);
      document.cookie = `token=${res.data.token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
      router.push('/admin');
    } catch (err: any) {
      setError(err.message ?? '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft size={16} />
          返回首页
        </Link>

        <h1 className="font-serif text-3xl font-bold tracking-tight">登录</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          欢迎回来，请登录你的账号
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5" autoComplete="off">
          <div className="glass-card flex items-center gap-3 px-4 py-3">
            <Mail size={18} className="text-muted-foreground" />
            <input
              type="email"
              placeholder="邮箱地址"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="off"
              className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/50"
            />
          </div>

          <div className="glass-card flex items-center gap-3 px-4 py-3">
            <Lock size={18} className="text-muted-foreground" />
            <input
              type="password"
              placeholder="密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/50"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-primary py-3 text-sm font-medium text-primary-foreground transition-all duration-300 hover:bg-primary/80 hover:shadow-[0_0_30px_rgba(139,125,255,0.3)] disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={18} className="mx-auto animate-spin" />
            ) : (
              '登录'
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
