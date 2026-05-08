export default function VehicleLoading() {
  return (
    <div className="platform-container pb-24">
      {/* Breadcrumbs skeleton */}
      <div className="pt-24 pb-6 px-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-3 w-10 rounded bg-mz-ash animate-pulse" />
          <div className="h-3 w-2 rounded bg-mz-ash animate-pulse" />
          <div className="h-3 w-16 rounded bg-mz-ash animate-pulse" />
          <div className="h-3 w-2 rounded bg-mz-ash animate-pulse" />
          <div className="h-3 w-28 rounded bg-mz-ash animate-pulse" />
        </div>
        <div className="h-4 w-16 rounded bg-mz-ash animate-pulse" />
      </div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Gallery skeleton */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-3xl overflow-hidden aspect-[16/10] bg-mz-ash animate-pulse" />
          <div className="flex gap-4">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-24 h-24 rounded-2xl bg-mz-ash animate-pulse flex-shrink-0" />
            ))}
          </div>
        </div>

        {/* Info skeleton */}
        <div className="lg:col-span-5 flex flex-col">
          {/* Brand + year */}
          <div className="flex items-center gap-3 mb-4">
            <div className="h-3 w-20 rounded bg-mz-ash animate-pulse" />
            <div className="h-6 w-14 rounded-full bg-mz-ash animate-pulse" />
          </div>
          {/* Title */}
          <div className="h-12 w-3/4 rounded-xl bg-mz-ash animate-pulse mb-3" />
          <div className="h-5 w-1/2 rounded-lg bg-mz-ash animate-pulse mb-10" />

          {/* Price card */}
          <div className="mb-10 p-8 rounded-[32px] border border-border bg-white space-y-4">
            <div className="h-3 w-24 rounded bg-mz-ash animate-pulse" />
            <div className="h-12 w-48 rounded-xl bg-mz-ash animate-pulse" />
            <div className="h-14 w-full rounded-2xl bg-mz-ash animate-pulse mt-8" />
          </div>

          {/* Specs grid */}
          <div className="grid grid-cols-2 gap-4 mb-10">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="p-4 rounded-2xl bg-mz-frost border border-border flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-mz-ash animate-pulse flex-shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-2 w-16 rounded bg-mz-ash animate-pulse" />
                  <div className="h-4 w-20 rounded bg-mz-ash animate-pulse" />
                </div>
              </div>
            ))}
          </div>

          {/* Partner card */}
          <div className="p-6 rounded-3xl bg-mz-frost border border-border space-y-3">
            <div className="h-4 w-36 rounded bg-mz-ash animate-pulse" />
            <div className="h-7 w-48 rounded-lg bg-mz-ash animate-pulse" />
            <div className="h-4 w-32 rounded bg-mz-ash animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
