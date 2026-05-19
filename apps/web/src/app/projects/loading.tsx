export default function ProjectsLoading() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-24">
      <div className="mb-12 text-center">
        <h1 className="font-serif text-4xl font-bold tracking-tight">作品集</h1>
        <p className="mt-3 text-muted-foreground">精选项目与创作</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="glass-card h-64 animate-pulse rounded-2xl p-6">
            <div className="mb-4 h-36 rounded-xl bg-muted-foreground/10" />
            <div className="mb-2 h-5 w-2/3 rounded bg-muted-foreground/10" />
            <div className="mb-3 h-3 w-full rounded bg-muted-foreground/10" />
            <div className="flex gap-2">
              <div className="h-5 w-14 rounded bg-muted-foreground/10" />
              <div className="h-5 w-12 rounded bg-muted-foreground/10" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
