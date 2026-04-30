// هيكل عظمي مفصّل لصفحة الأعمال العلمية — KPIs + فلاتر + جدول/بطاقات
import { Skeleton } from "@/components/ui/skeleton";

export function WorksPageSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      {/* رأس الصفحة */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-11 w-44" />
      </div>

      {/* KPIs */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-saei-purple-100 bg-white p-4 flex items-center gap-3"
          >
            <Skeleton className="h-11 w-11 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-7 w-12" />
            </div>
          </div>
        ))}
      </div>

      {/* لوحة الفلاتر */}
      <div className="rounded-2xl border border-saei-purple-100 bg-white p-5">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-11 rounded-xl" />
            </div>
          ))}
        </div>
      </div>

      {/* شريط البحث */}
      <Skeleton className="h-11 max-w-xl rounded-xl" />

      {/* جدول للشاشات الكبيرة */}
      <div className="hidden md:block rounded-2xl border border-saei-purple-100 bg-white overflow-hidden">
        <div className="h-12 bg-saei-purple-50/60 border-b border-saei-purple-100 flex items-center px-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <Skeleton key={i} className="h-3 w-20 first:flex-1" />
          ))}
        </div>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={i}
            className="h-20 border-t border-saei-purple-100/50 px-4 flex items-center gap-4"
          >
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/4" />
            </div>
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
        ))}
      </div>

      {/* بطاقات للجوال */}
      <div className="md:hidden space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-saei-purple-100 bg-white p-4 space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-5 w-3/4" />
              </div>
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
            <div className="flex gap-1.5">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-2 w-full rounded-full" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}
