export default function ArticlesLoading() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-24">
      <div className="mb-12 text-center">
        <h1 className="font-serif text-4xl font-bold tracking-tight">文章</h1>
        <p className="mt-3 text-muted-foreground">技术思考与创作记录</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="glass-card h-48 animate-pulse rounded-2xl p-6">
            <div className="mb-3 h-4 w-3/4 rounded bg-muted-foreground/10" />
            <div className="mb-2 h-3 w-full rounded bg-muted-foreground/10" />
            <div className="mb-2 h-3 w-5/6 rounded bg-muted-foreground/10" />
            <div className="mb-4 h-3 w-2/3 rounded bg-muted-foreground/10" />
            <div className="flex gap-2">
              <div className="h-5 w-12 rounded-full bg-muted-foreground/10" />
              <div className="h-5 w-16 rounded-full bg-muted-foreground/10" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
