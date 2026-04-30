import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type = "text", ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    className={cn(
      "flex h-11 w-full rounded-xl border border-saei-purple-200 bg-white px-4 py-2 text-sm",
      "placeholder:text-stone-400",
      "focus-visible:outline-none focus-visible:border-saei-purple focus-visible:ring-2 focus-visible:ring-saei-purple/20",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "transition-colors",
      // حالة خطأ — تُفعَّل من aria-invalid
      "aria-[invalid=true]:border-red-400 aria-[invalid=true]:focus-visible:border-red-500 aria-[invalid=true]:focus-visible:ring-red-200",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";

export { Input };
