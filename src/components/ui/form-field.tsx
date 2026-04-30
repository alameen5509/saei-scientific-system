"use client";

// FormField — يلفّ Label + Control + رسالة خطأ تحت الحقل
// — يربط htmlFor/aria-describedby/aria-invalid تلقائياً
// — يدعم required hint + helper text

import { useId, type ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

interface Props {
  label: string;
  error?: string | null;
  hint?: string;
  required?: boolean;
  className?: string;
  /**
   * مكوّن الإدخال — يستقبل id و aria-* تلقائياً عبر render prop.
   * مثال:
   *   <FormField label="الاسم" error={err}>
   *     {({ id, "aria-invalid": invalid, "aria-describedby": desc }) => (
   *       <Input id={id} aria-invalid={invalid} aria-describedby={desc} />
   *     )}
   *   </FormField>
   */
  children: (props: {
    id: string;
    "aria-invalid": boolean | undefined;
    "aria-describedby": string | undefined;
  }) => ReactNode;
}

export function FormField({
  label,
  error,
  hint,
  required,
  className,
  children,
}: Props) {
  const reactId = useId();
  const id = `field-${reactId}`;
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  const describedBy = error ? errorId : hint ? hintId : undefined;

  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id} className="flex items-center gap-1">
        {label}
        {required && (
          <span className="text-saei-gold-700 text-xs" aria-label="مطلوب">
            *
          </span>
        )}
      </Label>

      {children({
        id,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": describedBy,
      })}

      {error ? (
        <p
          id={errorId}
          role="alert"
          className="flex items-center gap-1.5 text-xs text-red-700"
        >
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      ) : hint ? (
        <p id={hintId} className="text-xs text-stone-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
