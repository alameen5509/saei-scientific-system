// هيكل عظمي لإظهاره أثناء الجلب الأولي
export function WorksTableSkeleton() {
  return (
    <div className="space-y-4 animate-pulse" aria-busy="true" aria-live="polite">
      {/* KPIs */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-saei-purple-100 bg-white p-4 flex items-center gap-3"
          >
            <div className="h-11 w-11 rounded-xl bg-saei-purple-100" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-20 bg-saei-purple-100 rounded" />
              <div className="h-6 w-12 bg-saei-purple-200 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Filters bar */}
      <div className="rounded-2xl border border-saei-purple-100 bg-white p-5">
        <div className="h-4 w-24 bg-saei-purple-100 rounded mb-4" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-3 w-16 bg-saei-purple-100 rounded" />
              <div className="h-11 bg-saei-purple-50 rounded-xl" />
            </div>
          ))}
        </div>
      </div>

      {/* Search bar */}
      <div className="h-11 max-w-xl bg-saei-purple-50 rounded-xl" />

      {/* Table rows */}
      <div className="rounded-2xl border border-saei-purple-100 bg-white overflow-hidden">
        <div className="h-12 bg-saei-purple-50/60" />
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={i}
            className="h-16 border-t border-saei-purple-100/50 px-4 flex items-center gap-4"
          >
            <div className="h-4 flex-1 bg-saei-purple-100 rounded" />
            <div className="h-4 w-20 bg-saei-purple-100 rounded" />
            <div className="h-4 w-16 bg-saei-purple-100 rounded" />
            <div className="h-4 w-24 bg-saei-purple-100 rounded" />
            <div className="h-4 w-20 bg-saei-purple-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
