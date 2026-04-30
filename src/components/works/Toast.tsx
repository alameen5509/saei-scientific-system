"use client";

// إشعار صغير ثابت في الزاوية السفلية اليسرى — يختفي تلقائياً
import { CheckCircle2, AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  type: "success" | "error";
  text: string;
  onClose: () => void;
}

export function Toast({ type, text, onClose }: Props) {
  const isSuccess = type === "success";
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "fixed bottom-4 left-4 z-50 flex items-center gap-3",
        "rounded-2xl border px-4 py-3 shadow-saei-md min-w-[280px] max-w-md",
        "animate-in slide-in-from-bottom-2",
        isSuccess
          ? "bg-emerald-50 border-emerald-200 text-emerald-800"
          : "bg-red-50 border-red-200 text-red-800"
      )}
    >
      {isSuccess ? (
        <CheckCircle2 className="h-5 w-5 shrink-0" />
      ) : (
        <AlertCircle className="h-5 w-5 shrink-0" />
      )}
      <span className="flex-1 text-sm font-bold">{text}</span>
      <button
        type="button"
        onClick={onClose}
        aria-label="إغلاق"
        className="shrink-0 opacity-60 hover:opacity-100"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
