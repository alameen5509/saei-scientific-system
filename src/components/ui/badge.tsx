import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold",
  {
    variants: {
      variant: {
        default: "bg-saei-purple text-white",
        purple: "bg-saei-purple-100 text-saei-purple-700",
        gold: "bg-saei-gold-100 text-saei-gold-700",
        teal: "bg-saei-teal-100 text-saei-teal-700",
        green: "bg-emerald-100 text-emerald-700",
        red: "bg-red-100 text-red-700",
        amber: "bg-amber-100 text-amber-700",
        gray: "bg-stone-200 text-stone-600",
        outline: "border border-saei-purple-200 text-saei-purple-700",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { badgeVariants };
