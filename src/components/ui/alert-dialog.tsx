"use client";

// AlertDialog — حوار تأكيد بنمط ساعي مع أيقونة وأنواع
import * as React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { AlertTriangle, Info, CheckCircle2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, type ButtonProps } from "@/components/ui/button";

// ————————————————————————————————
// Primitives بسيطة
// ————————————————————————————————

const AlertDialog = AlertDialogPrimitive.Root;
const AlertDialogTrigger = AlertDialogPrimitive.Trigger;
const AlertDialogPortal = AlertDialogPrimitive.Portal;

const AlertDialogOverlay = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-saei-purple-900/40 backdrop-blur-sm",
      "data-[state=open]:animate-in data-[state=closed]:animate-out",
      "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
));
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName;

const AlertDialogContent = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>
>(({ className, ...props }, ref) => (
  <AlertDialogPortal>
    <AlertDialogOverlay />
    <AlertDialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2",
        "rounded-2xl border border-saei-purple-100 bg-white p-6 shadow-saei-lg",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        className
      )}
      {...props}
    />
  </AlertDialogPortal>
));
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName;

const AlertDialogTitle = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-extrabold leading-tight text-saei-purple-700",
      className
    )}
    {...props}
  />
));
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName;

const AlertDialogDescription = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-stone-600 leading-relaxed", className)}
    {...props}
  />
));
AlertDialogDescription.displayName =
  AlertDialogPrimitive.Description.displayName;

const AlertDialogAction = AlertDialogPrimitive.Action;
const AlertDialogCancel = AlertDialogPrimitive.Cancel;

// ————————————————————————————————
// مكوّن جاهز للاستخدام: ConfirmDialog
// — controlled (open + onOpenChange)
// — variant يُحدّد الأيقونة واللون وزر التأكيد
// ————————————————————————————————

export type ConfirmVariant = "danger" | "warning" | "info" | "success";

const VARIANT_META: Record<
  ConfirmVariant,
  {
    Icon: React.ComponentType<{ className?: string }>;
    iconClass: string;
    iconBg: string;
    confirmVariant: ButtonProps["variant"];
  }
> = {
  danger: {
    Icon: Trash2,
    iconClass: "text-red-600",
    iconBg: "bg-red-100",
    confirmVariant: "danger",
  },
  warning: {
    Icon: AlertTriangle,
    iconClass: "text-amber-700",
    iconBg: "bg-amber-100",
    confirmVariant: "gold",
  },
  info: {
    Icon: Info,
    iconClass: "text-saei-teal",
    iconBg: "bg-saei-teal-50",
    confirmVariant: "primary",
  },
  success: {
    Icon: CheckCircle2,
    iconClass: "text-emerald-600",
    iconBg: "bg-emerald-100",
    confirmVariant: "primary",
  },
};

interface ConfirmDialogProps {
  open: boolean;
  variant?: ConfirmVariant;
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: () => void | Promise<void>;
}

export function ConfirmDialog({
  open,
  variant = "warning",
  title,
  description,
  confirmLabel = "تأكيد",
  cancelLabel = "إلغاء",
  loading = false,
  onOpenChange,
  onConfirm,
}: ConfirmDialogProps) {
  const meta = VARIANT_META[variant];
  const Icon = meta.Icon;

  return (
    <AlertDialog
      open={open}
      onOpenChange={(v) => !loading && onOpenChange(v)}
    >
      <AlertDialogContent>
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "h-12 w-12 rounded-2xl grid place-items-center shrink-0",
              meta.iconBg
            )}
          >
            <Icon className={cn("h-6 w-6", meta.iconClass)} />
          </div>
          <div className="flex-1 space-y-1.5">
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div>{description}</div>
            </AlertDialogDescription>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-start gap-2 mt-6">
          <AlertDialogAction asChild>
            <Button
              type="button"
              variant={meta.confirmVariant}
              disabled={loading}
              onClick={(e) => {
                e.preventDefault();
                void onConfirm();
              }}
            >
              {loading ? "جاري التنفيذ..." : confirmLabel}
            </Button>
          </AlertDialogAction>
          <AlertDialogCancel asChild>
            <Button type="button" variant="ghost" disabled={loading}>
              {cancelLabel}
            </Button>
          </AlertDialogCancel>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};
