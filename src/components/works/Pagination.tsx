"use client";

// شريط ترقيم بسيط — يدعم RTL (السهم يسار = التالي بالمنطق العربي)
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, toArabicDigits } from "@/lib/utils";

interface Props {
  page: number;
  pageCount: number;
  total: number;
  pageSize: number;
  onChange: (page: number) => void;
}

export function Pagination({
  page,
  pageCount,
  total,
  pageSize,
  onChange,
}: Props) {
  if (pageCount <= 1) {
    return (
      <div className="flex items-center justify-center text-xs text-stone-500 pt-2">
        إجمالي {toArabicDigits(total)} عمل
      </div>
    );
  }

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  // أرقام الصفحات: 1 ... current-1 current current+1 ... last
  const pages: (number | "...")[] = [];
  for (let i = 1; i <= pageCount; i++) {
    if (
      i === 1 ||
      i === pageCount ||
      (i >= page - 1 && i <= page + 1)
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
      <p className="text-xs text-stone-500">
        عرض {toArabicDigits(start)}–{toArabicDigits(end)} من{" "}
        {toArabicDigits(total)}
      </p>

      <div className="flex items-center gap-1">
        {/* في RTL، "السابق" يقع يميناً ويُرسم بـChevronRight */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          aria-label="الصفحة السابقة"
        >
          <ChevronRight className="h-4 w-4" />
          السابق
        </Button>

        <div className="flex items-center gap-1 px-1">
          {pages.map((p, idx) =>
            p === "..." ? (
              <span
                key={`ellipsis-${idx}`}
                className="px-2 text-stone-400 text-xs"
              >
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => onChange(p)}
                className={cn(
                  "h-8 min-w-[2rem] px-2 rounded-lg text-xs font-bold tabular-nums transition-colors",
                  p === page
                    ? "bg-saei-hero text-white shadow-saei-sm"
                    : "text-saei-purple-700 hover:bg-saei-purple-50"
                )}
                aria-current={p === page ? "page" : undefined}
              >
                {toArabicDigits(p)}
              </button>
            )
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange(page + 1)}
          disabled={page >= pageCount}
          aria-label="الصفحة التالية"
        >
          التالي
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
