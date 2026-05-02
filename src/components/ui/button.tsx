// زر بنمط ساعي — هوية تركوازية/سماوية
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saei-sky focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        // primary = تركوازي مع تدرج
        primary:
          "bg-saei-hero text-white hover:opacity-90 shadow-saei-sm",
        // gold (الاسم محفوظ) = الآن أزرق سماوي
        gold: "bg-saei-sky text-white hover:bg-saei-sky-600 shadow-saei-sm",
        // teal = درجة وسطى
        teal: "bg-saei-teal text-white hover:bg-saei-teal-600 shadow-saei-sm",
        outline:
          "border-2 border-saei-cyan-700 text-saei-cyan-700 hover:bg-saei-cyan hover:text-white hover:border-saei-cyan",
        ghost:
          "text-saei-cyan-700 hover:bg-saei-cyan-50 hover:text-saei-cyan-800",
        danger: "bg-red-600 text-white hover:bg-red-700",
        link: "text-saei-sky-700 underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-9 px-4",
        md: "h-11 px-6",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
