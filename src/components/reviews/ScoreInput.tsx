"use client";

// مدخل تقييم بـ١٠ نقاط — أزرار متراصّة بألوان متدرّجة
import { cn } from "@/lib/utils";
import { toArabicDigits } from "@/lib/utils";

interface Props {
  label: string;
  description?: string;
  value: number | null;
  onChange: (v: number) => void;
  disabled?: boolean;
}

function colorForScore(n: number): string {
  if (n <= 3) return "bg-red-500 text-white border-red-500";
  if (n <= 5) return "bg-amber-500 text-white border-amber-500";
  if (n <= 7) return "bg-saei-gold text-saei-purple-900 border-saei-gold";
  return "bg-emerald-500 text-white border-emerald-500";
}

export function ScoreInput({
  label,
  description,
  value,
  onChange,
  disabled,
}: Props) {
  return (
    <div className="space-y-2">
      <div>
        <div className="font-bold text-saei-purple-700">{label}</div>
        {description && (
          <p className="text-xs text-stone-600 mt-0.5">{description}</p>
        )}
      </div>
      <div className="flex flex-wrap gap-1">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
          const active = value === n;
          return (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              disabled={disabled}
              aria-label={`${n} من ١٠`}
              className={cn(
                "h-10 w-10 rounded-xl border-2 font-bold tabular-nums transition-all",
                active
                  ? colorForScore(n) + " shadow-saei-sm scale-105"
                  : "bg-white border-saei-purple-200 text-saei-purple-700 hover:border-saei-purple",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              {toArabicDigits(n)}
            </button>
          );
        })}
      </div>
      {value !== null && (
        <div className="text-xs text-stone-600">
          الدرجة المختارة:{" "}
          <span className="font-bold text-saei-purple-700 tabular-nums">
            {toArabicDigits(value)} / ١٠
          </span>
        </div>
      )}
    </div>
  );
}
