"use client";

// نظام Toast متكامل عبر Context — 4 أنواع، كومة، إغلاق تلقائي
// الاستخدام:
//   const toast = useToast();
//   toast.success("تمّ الحفظ");
//   toast.error("فشل التحديث");
//   toast.warning("هذا التعديل لن يكون قابلاً للتراجع");
//   toast.info("جاري التحديث في الخلفية");

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "warning" | "info";

interface ToastItem {
  id: number;
  type: ToastType;
  text: string;
  description?: string;
  duration: number;
}

interface ToastApi {
  show: (
    type: ToastType,
    text: string,
    options?: { description?: string; duration?: number }
  ) => void;
  success: (
    text: string,
    options?: { description?: string; duration?: number }
  ) => void;
  error: (
    text: string,
    options?: { description?: string; duration?: number }
  ) => void;
  warning: (
    text: string,
    options?: { description?: string; duration?: number }
  ) => void;
  info: (
    text: string,
    options?: { description?: string; duration?: number }
  ) => void;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

// ————————————————————————————————
// Provider
// ————————————————————————————————

const TYPE_META: Record<
  ToastType,
  {
    Icon: React.ComponentType<{ className?: string }>;
    border: string;
    bg: string;
    text: string;
    iconClass: string;
  }
> = {
  success: {
    Icon: CheckCircle2,
    border: "border-emerald-200",
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    iconClass: "text-emerald-600",
  },
  error: {
    Icon: AlertCircle,
    border: "border-red-200",
    bg: "bg-red-50",
    text: "text-red-800",
    iconClass: "text-red-600",
  },
  warning: {
    Icon: AlertTriangle,
    border: "border-amber-200",
    bg: "bg-amber-50",
    text: "text-amber-800",
    iconClass: "text-amber-600",
  },
  info: {
    Icon: Info,
    border: "border-saei-teal-200",
    bg: "bg-saei-teal-50",
    text: "text-saei-purple-700",
    iconClass: "text-saei-teal",
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setItems((all) => all.filter((t) => t.id !== id));
  }, []);

  const show = useCallback<ToastApi["show"]>(
    (type, text, options) => {
      const id = ++idRef.current;
      const duration = options?.duration ?? 4000;
      setItems((all) => [
        ...all,
        { id, type, text, description: options?.description, duration },
      ]);
    },
    []
  );

  const api = useMemo<ToastApi>(
    () => ({
      show,
      success: (text, options) => show("success", text, options),
      error: (text, options) => show("error", text, options),
      warning: (text, options) => show("warning", text, options),
      info: (text, options) => show("info", text, options),
      dismiss,
    }),
    [show, dismiss]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastViewport items={items} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

// ————————————————————————————————
// Viewport
// ————————————————————————————————

function ToastViewport({
  items,
  onDismiss,
}: {
  items: ToastItem[];
  onDismiss: (id: number) => void;
}) {
  return (
    <div
      role="region"
      aria-label="إشعارات النظام"
      className="fixed bottom-4 left-4 z-[60] flex flex-col gap-2 max-w-md w-[calc(100%-2rem)] sm:w-auto"
    >
      {items.map((it) => (
        <ToastItem key={it.id} item={it} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({
  item,
  onDismiss,
}: {
  item: ToastItem;
  onDismiss: (id: number) => void;
}) {
  const meta = TYPE_META[item.type];
  const Icon = meta.Icon;

  // إغلاق تلقائي
  useEffect(() => {
    if (item.duration <= 0) return;
    const t = setTimeout(() => onDismiss(item.id), item.duration);
    return () => clearTimeout(t);
  }, [item.id, item.duration, onDismiss]);

  return (
    <div
      role={item.type === "error" ? "alert" : "status"}
      aria-live={item.type === "error" ? "assertive" : "polite"}
      className={cn(
        "flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-saei-md",
        "animate-in slide-in-from-bottom-2 fade-in-50",
        meta.border,
        meta.bg,
        meta.text
      )}
    >
      <Icon className={cn("h-5 w-5 shrink-0 mt-0.5", meta.iconClass)} />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold">{item.text}</div>
        {item.description && (
          <div className="text-xs opacity-80 mt-0.5">{item.description}</div>
        )}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(item.id)}
        aria-label="إغلاق الإشعار"
        className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
