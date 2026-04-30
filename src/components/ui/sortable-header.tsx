"use client";

// زرّ رأس عمود قابل للترتيب — يدعم RTL، يعرض السهم وفق الاتجاه الحالي
import { ArrowUpDown, ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

export type SortDirection = "asc" | "desc";

export interface SortState<K extends string = string> {
  key: K;
  direction: SortDirection;
}

/** يعكس الاتجاه أو يعيد ضبطه إلى المفتاح الجديد */
export function toggleSort<K extends string>(
  prev: SortState<K> | null,
  key: K,
  defaultDirection: SortDirection = "asc"
): SortState<K> {
  if (!prev || prev.key !== key) return { key, direction: defaultDirection };
  return {
    key,
    direction: prev.direction === "asc" ? "desc" : "asc",
  };
}

interface Props<K extends string> {
  label: string;
  sortKey: K;
  current: SortState<K> | null;
  onSort: (key: K) => void;
  align?: "right" | "left" | "center";
  className?: string;
}

export function SortableHeader<K extends string>({
  label,
  sortKey,
  current,
  onSort,
  align = "right",
  className,
}: Props<K>) {
  const active = current?.key === sortKey;
  const dir = active ? current!.direction : null;

  const Arrow = !active ? ArrowUpDown : dir === "asc" ? ArrowUp : ArrowDown;

  return (
    <button
      type="button"
      onClick={() => onSort(sortKey)}
      className={cn(
        "inline-flex items-center gap-1.5 font-bold text-xs uppercase tracking-wide transition-colors",
        active
          ? "text-saei-purple-700"
          : "text-saei-purple-700/80 hover:text-saei-purple-700",
        align === "left" && "flex-row-reverse",
        className
      )}
      aria-sort={
        !active ? "none" : dir === "asc" ? "ascending" : "descending"
      }
    >
      <span>{label}</span>
      <Arrow
        className={cn(
          "h-3.5 w-3.5 transition-opacity",
          active ? "opacity-100" : "opacity-50"
        )}
        aria-hidden
      />
    </button>
  );
}
