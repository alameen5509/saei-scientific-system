// حالة فارغة احترافية مع أيقونة + عنوان + وصف + إجراء اختياري
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  variant?: "default" | "subtle";
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  variant = "default",
  className,
}: Props) {
  return (
    <div
      className={cn(
        "rounded-2xl border bg-white",
        variant === "default"
          ? "border-saei-purple-100"
          : "border-dashed border-saei-purple-200/70 bg-saei-purple-50/30",
        className
      )}
    >
      <div className="flex flex-col items-center text-center px-6 py-12 sm:py-16">
        {/* أيقونة + هالة */}
        <div className="relative mb-4">
          <div className="absolute inset-0 rounded-full bg-saei-purple/10 blur-xl scale-150" />
          <div className="relative h-16 w-16 rounded-2xl bg-gradient-to-br from-saei-purple-50 to-saei-gold-50 grid place-items-center text-saei-purple-700 shadow-saei-sm">
            <Icon className="h-8 w-8" />
          </div>
        </div>

        <h3 className="text-lg font-extrabold text-saei-purple-700 mb-1">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-stone-600 leading-relaxed max-w-md">
            {description}
          </p>
        )}
        {action && <div className="mt-5">{action}</div>}
      </div>
    </div>
  );
}
