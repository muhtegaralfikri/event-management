export default function Loading() {
  return (
    <main className="min-h-screen">
      {/* Header skeleton */}
      <div className="sticky top-0 z-40 border-b border-stone-200/80 bg-[#fffdf8]/90 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="h-9 w-32 animate-pulse rounded-md bg-stone-200" />
          <div className="flex gap-2">
            <div className="h-9 w-20 animate-pulse rounded-md bg-stone-100" />
            <div className="h-9 w-24 animate-pulse rounded-md bg-stone-100" />
            <div className="h-9 w-24 animate-pulse rounded-md bg-stone-100" />
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
        <div className="mb-8 space-y-3">
          <div className="h-8 w-64 animate-pulse rounded-md bg-stone-200" />
          <div className="h-5 w-96 animate-pulse rounded-md bg-stone-100" />
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-lg border border-stone-200 bg-[#fffdf8]"
            >
              <div className="aspect-[16/9] animate-pulse bg-stone-200" />
              <div className="space-y-3 p-5">
                <div className="h-4 w-40 animate-pulse rounded bg-stone-100" />
                <div className="h-6 w-full animate-pulse rounded bg-stone-200" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-stone-100" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-16 animate-pulse rounded-md bg-stone-100" />
                  <div className="h-16 animate-pulse rounded-md bg-stone-100" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
