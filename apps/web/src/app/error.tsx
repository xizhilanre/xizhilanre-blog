'use client';

import { useEffect } from 'react';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <div className="rounded-full bg-destructive/10 p-4">
        <div className="h-8 w-8 rounded-full border-2 border-destructive/30 border-t-destructive animate-spin" />
      </div>
      <h2 className="font-serif text-xl font-semibold text-foreground">出错了</h2>
      <p className="text-sm text-muted-foreground">
        {error.message || '页面加载失败，请稍后重试'}
      </p>
      <button
        onClick={reset}
        className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
      >
        重试
      </button>
    </div>
  );
}
