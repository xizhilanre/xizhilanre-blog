import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <p className="font-serif text-8xl font-bold text-muted-foreground/20">404</p>
      <h2 className="font-serif text-xl font-semibold text-foreground">页面不存在</h2>
      <p className="text-sm text-muted-foreground">
        您访问的页面可能已被移除或地址有误
      </p>
      <Link
        href="/"
        className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
      >
        返回首页
      </Link>
    </div>
  );
}
